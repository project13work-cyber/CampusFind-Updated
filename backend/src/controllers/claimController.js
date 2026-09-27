const Claim = require('../models/Claim');
const FoundItem = require('../models/FoundItem');
const LostItem = require('../models/LostItem');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// POST /api/claims
const createClaim = async (req, res) => {
  try {
    const {
      foundItemId,
      lostItemId,
      matchId,
      whereLost,
      uniqueFeatures,
      insideOrAttached
    } = req.body;

    if (!foundItemId || !whereLost || !uniqueFeatures || !insideOrAttached) {
      return res.status(400).json({
        success: false,
        message: 'All verification questions are required to submit an ownership claim.'
      });
    }

    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item record does not exist.'
      });
    }

    // Check if duplicate pending claim exists for this user
    const existingClaim = await Claim.findOne({
      foundItemId,
      claimantUserId: req.user._id,
      status: { $in: ['PENDING_REVIEW', 'MORE_INFO_REQUESTED', 'APPROVED'] }
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active claim under review for this item.'
      });
    }

    // Handle proof images
    const proofImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        proofImages.push(`/uploads/${file.filename}`);
      });
    }

    const claim = await Claim.create({
      foundItemId,
      lostItemId: lostItemId || undefined,
      matchId: matchId || undefined,
      claimantUserId: req.user._id,
      answers: {
        whereLost: whereLost.trim(),
        uniqueFeatures: uniqueFeatures.trim(),
        insideOrAttached: insideOrAttached.trim()
      },
      proofImages,
      status: 'PENDING_REVIEW'
    });

    // Update item statuses
    foundItem.status = 'CLAIM_PENDING';
    await foundItem.save();

    if (lostItemId) {
      const lostItem = await LostItem.findById(lostItemId);
      if (lostItem) {
        lostItem.status = 'CLAIM_PENDING';
        await lostItem.save();
      }
    }

    // Create student confirmation notification
    await createNotification({
      userId: req.user._id,
      type: 'CLAIM_SUBMITTED',
      title: 'Claim Submitted for Review',
      message: `Your ownership claim for "${foundItem.itemName}" has been received. College admin and security office will verify your answers against item identifiers.`,
      relatedItemId: foundItem._id,
      relatedItemType: 'FoundItem',
      relatedClaimId: claim._id
    });

    // Notify Admins
    const admins = await User.find({ role: 'ADMIN' });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        type: 'CLAIM_SUBMITTED',
        title: 'New Ownership Claim Submitted',
        message: `Student ${req.user.name} (${req.user.studentId}) submitted an ownership claim for "${foundItem.itemName}". Verification required.`,
        relatedItemId: foundItem._id,
        relatedItemType: 'FoundItem',
        relatedClaimId: claim._id
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. An administrator will review your verification details.',
      claim
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit claim.',
      error: error.message
    });
  }
};

// GET /api/claims
const getClaims = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) filter.status = status;

    if (req.user.role !== 'ADMIN') {
      // Students only see their own claims
      filter.claimantUserId = req.user._id;
    }

    const claims = await Claim.find(filter)
      .sort({ createdAt: -1 })
      .populate('foundItemId')
      .populate('lostItemId')
      .populate('claimantUserId', 'name email studentId phone')
      .populate('reviewedBy', 'name');

    // If student, remove privateIdentifier from foundItem/lostItem
    const sanitized = claims.map(claim => {
      const obj = claim.toObject();
      if (req.user.role !== 'ADMIN') {
        if (obj.foundItemId) delete obj.foundItemId.privateIdentifier;
        if (obj.lostItemId) delete obj.lostItemId.privateIdentifier;
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: sanitized.length,
      claims: sanitized
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching claims',
      error: error.message
    });
  }
};

// GET /api/claims/:id
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('foundItemId')
      .populate('lostItemId')
      .populate('claimantUserId', 'name email studentId phone')
      .populate('reviewedBy', 'name');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found.'
      });
    }

    const isClaimant = claim.claimantUserId?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isClaimant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this claim.'
      });
    }

    const obj = claim.toObject();
    if (!isAdmin) {
      if (obj.foundItemId) delete obj.foundItemId.privateIdentifier;
      if (obj.lostItemId) delete obj.lostItemId.privateIdentifier;
    }

    return res.status(200).json({
      success: true,
      claim: obj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving claim details',
      error: error.message
    });
  }
};

module.exports = {
  createClaim,
  getClaims,
  getClaimById
};
