const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const { createNotification } = require('./notificationService');

// Related categories dictionary for fuzzy category matching
const RELATED_CATEGORIES = {
  'Earphones': ['Headphones'],
  'Headphones': ['Earphones'],
  'Laptop Bag': ['Backpack'],
  'Backpack': ['Laptop Bag'],
  'ID Card': ['Documents', 'Wallet'],
  'Wallet': ['ID Card', 'Documents'],
  'Books': ['Documents', 'Notebook']
};

// Common stop words to ignore during description text matching
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
  'of', 'is', 'it', 'my', 'i', 'was', 'near', 'found', 'lost', 'item', 'inside',
  'around', 'table', 'canteen', 'there', 'some', 'has', 'have'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function calculateJaccard(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Calculates a multi-factor similarity score between 0 and 100
 */
function calculateMatchScore(lost, found) {
  let locationScore = 0;
  let categoryScore = 0;
  let dateTimeScore = 0;
  let colorScore = 0;
  let brandScore = 0;
  let descriptionScore = 0;
  let imageScore = 0;
  const details = [];

  // 1. Location Matching (Max: 30%)
  const sameLocation = lost.locationName && found.locationName &&
    lost.locationName.trim().toLowerCase() === found.locationName.trim().toLowerCase();

  if (sameLocation) {
    locationScore += 10;
    details.push(`Same campus location: ${lost.locationName}`);

    // Zone comparison
    if (lost.zone && found.zone && lost.zone.trim().toLowerCase() === found.zone.trim().toLowerCase()) {
      locationScore += 10;
      details.push(`Identical zone: ${lost.zone}`);
    }

    // Coordinate proximity comparison
    if (lost.mapCoordinates && found.mapCoordinates &&
        lost.mapCoordinates.x != null && found.mapCoordinates.x != null) {
      const dx = lost.mapCoordinates.x - found.mapCoordinates.x;
      const dy = lost.mapCoordinates.y - found.mapCoordinates.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= 60) {
        locationScore += 10;
        details.push(`Pin distance very close (${Math.round(distance)} map units)`);
      } else if (distance <= 150) {
        locationScore += 7;
        details.push(`Pin distance nearby (${Math.round(distance)} map units)`);
      } else if (distance <= 300) {
        locationScore += 4;
        details.push(`Pin distance in vicinity (${Math.round(distance)} map units)`);
      }
    } else if (locationScore < 20) {
      // Fallback zone heuristic
      locationScore += 5;
    }
  }
  locationScore = Math.min(30, locationScore);

  // 2. Category Matching (Max: 20%)
  if (lost.category && found.category) {
    if (lost.category.toLowerCase() === found.category.toLowerCase()) {
      categoryScore = 20;
      details.push(`Exact category match: ${lost.category}`);
    } else if (
      RELATED_CATEGORIES[lost.category]?.includes(found.category) ||
      RELATED_CATEGORIES[found.category]?.includes(lost.category)
    ) {
      categoryScore = 10;
      details.push(`Related category match: ${lost.category} ~ ${found.category}`);
    }
  }

  // 3. Date & Time Proximity (Max: 15%)
  if (lost.lostDate && found.foundDate) {
    const lDate = new Date(lost.lostDate);
    const fDate = new Date(found.foundDate);
    const diffDays = Math.abs((lDate - fDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0.5) {
      dateTimeScore += 10;
      details.push('Lost and found on the exact same date');
    } else if (diffDays <= 2) {
      dateTimeScore += 7;
      details.push(`Dates within ${Math.round(diffDays)} day(s)`);
    } else if (diffDays <= 5) {
      dateTimeScore += 4;
      details.push(`Dates within 5 days`);
    } else {
      dateTimeScore += 1;
    }

    // Time proximity check
    const lTime = (lost.approxTime || lost.timeRange || '').toLowerCase();
    const fTime = (found.foundTime || '').toLowerCase();
    if (lTime && fTime) {
      const wordsL = lTime.match(/\d+/g) || [];
      const wordsF = fTime.match(/\d+/g) || [];
      const commonNumbers = wordsL.filter(n => wordsF.includes(n));
      if (commonNumbers.length > 0 || lTime.includes(fTime) || fTime.includes(lTime)) {
        dateTimeScore += 5;
        details.push('Overlapping or matching time window');
      }
    }
  }
  dateTimeScore = Math.min(15, dateTimeScore);

  // 4. Color Matching (Max: 10%)
  if (lost.color && found.color) {
    const lostColor = lost.color.toLowerCase().trim();
    const foundColor = found.color.toLowerCase().trim();
    if (lostColor === foundColor || lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
      colorScore = 10;
      details.push(`Color match: ${lost.color}`);
    } else {
      // Check if color mentioned in description
      const fDesc = (found.description || '').toLowerCase();
      const lDesc = (lost.description || '').toLowerCase();
      if (fDesc.includes(lostColor) || lDesc.includes(foundColor)) {
        colorScore = 6;
        details.push(`Color referenced in report text`);
      }
    }
  }

  // 5. Brand & Model Matching (Max: 10%)
  const lostBrand = (lost.brand || '').toLowerCase().trim();
  const foundBrand = (found.brand || '').toLowerCase().trim();
  const lostModel = (lost.model || '').toLowerCase().trim();
  const foundModel = (found.model || '').toLowerCase().trim();

  if (lostBrand && foundBrand) {
    if (lostBrand === foundBrand || lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
      brandScore += 6;
      details.push(`Brand match: ${lost.brand}`);
    }
  }

  if (lostModel && foundModel) {
    if (lostModel === foundModel || lostModel.includes(foundModel) || foundModel.includes(lostModel)) {
      brandScore += 4;
      details.push(`Model match: ${lost.model}`);
    }
  } else if (brandScore > 0) {
    // Partial model overlap from description
    const fTokens = tokenize(found.description);
    if (lostModel && fTokens.some(t => lostModel.includes(t))) {
      brandScore += 2;
    }
  }
  brandScore = Math.min(10, brandScore);

  // 6. Text & Description Similarity (Max: 10%)
  const textLost = `${lost.itemName} ${lost.description || ''} ${lost.exactSpot || ''}`;
  const textFound = `${found.itemName} ${found.description || ''} ${found.exactSpot || ''}`;
  const tokensL = tokenize(textLost);
  const tokensF = tokenize(textFound);
  const jaccard = calculateJaccard(tokensL, tokensF);

  // Also check exact itemName word match
  const nameL = lost.itemName.toLowerCase();
  const nameF = found.itemName.toLowerCase();
  let nameOverlap = false;
  const nameWordsL = nameL.split(/\s+/).filter(w => w.length > 2);
  const nameWordsF = nameF.split(/\s+/).filter(w => w.length > 2);
  if (nameWordsL.some(w => nameWordsF.includes(w))) {
    nameOverlap = true;
  }

  if (jaccard > 0.4 || (nameOverlap && jaccard > 0.2)) {
    descriptionScore = 10;
    details.push('High textual similarity in titles and descriptions');
  } else if (jaccard > 0.2 || nameOverlap) {
    descriptionScore = 7;
    details.push('Notable keyword overlap in descriptions');
  } else if (jaccard > 0.05) {
    descriptionScore = 4;
    details.push('Common descriptive terms present');
  }

  // 7. Images / Attributes Completeness (Max: 5%)
  if (lost.images?.length > 0 && found.images?.length > 0) {
    imageScore = 5;
    details.push('Photographic documentation provided on both reports');
  } else if (lost.images?.length > 0 || found.images?.length > 0) {
    imageScore = 3;
  }

  const totalScore = Math.min(100, Math.round(
    locationScore + categoryScore + dateTimeScore + colorScore + brandScore + descriptionScore + imageScore
  ));

  let matchLevel = 'Low';
  if (totalScore >= 90) matchLevel = 'Very High';
  else if (totalScore >= 75) matchLevel = 'High';
  else if (totalScore >= 50) matchLevel = 'Possible';

  return {
    score: totalScore,
    matchLevel,
    matchingFactors: {
      locationScore,
      categoryScore,
      dateTimeScore,
      colorScore,
      brandScore,
      descriptionScore,
      imageScore,
      details
    }
  };
}

/**
 * Runs matching logic for a specific Lost Item against all active Found Items
 */
async function runMatchingForLostItem(lostItemId) {
  try {
    const lostItem = await LostItem.findById(lostItemId);
    if (!lostItem || ['RETURNED', 'CLOSED'].includes(lostItem.status)) return [];

    const foundItems = await FoundItem.find({
      status: { $nin: ['RETURNED', 'CLOSED'] }
    });

    const generatedMatches = [];

    for (const foundItem of foundItems) {
      // Don't match item against same reporter if duplicate
      const result = calculateMatchScore(lostItem, foundItem);

      if (result.score >= 50) {
        const match = await Match.findOneAndUpdate(
          { lostItemId: lostItem._id, foundItemId: foundItem._id },
          {
            score: result.score,
            matchLevel: result.matchLevel,
            matchingFactors: result.matchingFactors,
            $setOnInsert: { status: 'POTENTIAL' }
          },
          { upsert: true, new: true }
        );

        generatedMatches.push(match);

        // Notify lost item owner if high match and not already notified
        if (result.score >= 75 && lostItem.userId.toString() !== foundItem.userId.toString()) {
          await createNotification({
            userId: lostItem.userId,
            type: 'MATCH_FOUND',
            title: `Possible Match Found! (${result.score}%)`,
            message: `A ${foundItem.color ? foundItem.color + ' ' : ''}${foundItem.itemName} found at ${foundItem.locationName} matches your reported lost item.`,
            relatedItemId: foundItem._id,
            relatedItemType: 'FoundItem',
            relatedMatchId: match._id
          });

          // Update status
          if (lostItem.status === 'REPORTED' || lostItem.status === 'APPROVED' || lostItem.status === 'SEARCHING') {
            lostItem.status = 'MATCH_FOUND';
            await lostItem.save();
          }

          if (foundItem.status === 'REPORTED' || foundItem.status === 'APPROVED') {
            foundItem.status = 'MATCHING';
            await foundItem.save();
          }
        }
      }
    }

    return generatedMatches;
  } catch (error) {
    console.error(`[MatchingEngine] Error matching lost item ${lostItemId}: ${error.message}`);
    return [];
  }
}

/**
 * Runs matching logic for a specific Found Item against all active Lost Items
 */
async function runMatchingForFoundItem(foundItemId) {
  try {
    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem || ['RETURNED', 'CLOSED'].includes(foundItem.status)) return [];

    const lostItems = await LostItem.find({
      status: { $nin: ['RETURNED', 'CLOSED'] }
    });

    const generatedMatches = [];

    for (const lostItem of lostItems) {
      const result = calculateMatchScore(lostItem, foundItem);

      if (result.score >= 50) {
        const match = await Match.findOneAndUpdate(
          { lostItemId: lostItem._id, foundItemId: foundItem._id },
          {
            score: result.score,
            matchLevel: result.matchLevel,
            matchingFactors: result.matchingFactors,
            $setOnInsert: { status: 'POTENTIAL' }
          },
          { upsert: true, new: true }
        );

        generatedMatches.push(match);

        if (result.score >= 75 && lostItem.userId.toString() !== foundItem.userId.toString()) {
          await createNotification({
            userId: lostItem.userId,
            type: 'MATCH_FOUND',
            title: `Possible Match Found! (${result.score}%)`,
            message: `A ${foundItem.color ? foundItem.color + ' ' : ''}${foundItem.itemName} found at ${foundItem.locationName} may match your lost item.`,
            relatedItemId: foundItem._id,
            relatedItemType: 'FoundItem',
            relatedMatchId: match._id
          });

          if (lostItem.status === 'REPORTED' || lostItem.status === 'APPROVED' || lostItem.status === 'SEARCHING') {
            lostItem.status = 'MATCH_FOUND';
            await lostItem.save();
          }

          if (foundItem.status === 'REPORTED' || foundItem.status === 'APPROVED') {
            foundItem.status = 'MATCHING';
            await foundItem.save();
          }
        }
      }
    }

    return generatedMatches;
  } catch (error) {
    console.error(`[MatchingEngine] Error matching found item ${foundItemId}: ${error.message}`);
    return [];
  }
}

module.exports = {
  calculateMatchScore,
  runMatchingForLostItem,
  runMatchingForFoundItem
};
