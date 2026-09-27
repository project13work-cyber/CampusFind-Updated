const Match = require('../models/Match');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

// GET /api/matches
const getMatches = async (req, res) => {
  try {
    const { minScore = 50, lostItemId, foundItemId } = req.query;

    const filter = { score: { $gte: parseInt(minScore, 10) } };

    if (lostItemId) filter.lostItemId = lostItemId;
    if (foundItemId) filter.foundItemId = foundItemId;

    let matches = await Match.find(filter)
      .sort({ score: -1, createdAt: -1 })
      .populate('lostItemId')
      .populate('foundItemId');

    // Filter by user role if not ADMIN
    if (req.user.role !== 'ADMIN') {
      matches = matches.filter(match => {
        const lostOwner = match.lostItemId?.userId?.toString();
        const foundOwner = match.foundItemId?.userId?.toString();
        const currentUserId = req.user._id.toString();
        return lostOwner === currentUserId || foundOwner === currentUserId;
      });
    }

    // Sanitize privateIdentifier
    const sanitizedMatches = matches.map(match => {
      const obj = match.toObject();
      if (req.user.role !== 'ADMIN') {
        if (obj.lostItemId && obj.lostItemId.userId?.toString() !== req.user._id.toString()) {
          delete obj.lostItemId.privateIdentifier;
        }
        if (obj.foundItemId && obj.foundItemId.userId?.toString() !== req.user._id.toString()) {
          delete obj.foundItemId.privateIdentifier;
        }
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: sanitizedMatches.length,
      matches: sanitizedMatches
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve matches',
      error: error.message
    });
  }
};

// GET /api/matches/:id
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match record not found.'
      });
    }

    const lostOwner = match.lostItemId?.userId?.toString();
    const foundOwner = match.foundItemId?.userId?.toString();
    const currentUserId = req.user._id.toString();
    const isAuthorized = req.user.role === 'ADMIN' || lostOwner === currentUserId || foundOwner === currentUserId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this match.'
      });
    }

    const obj = match.toObject();
    if (req.user.role !== 'ADMIN') {
      if (obj.lostItemId && lostOwner !== currentUserId) {
        delete obj.lostItemId.privateIdentifier;
      }
      if (obj.foundItemId && foundOwner !== currentUserId) {
        delete obj.foundItemId.privateIdentifier;
      }
    }

    return res.status(200).json({
      success: true,
      match: obj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching match details',
      error: error.message
    });
  }
};

module.exports = {
  getMatches,
  getMatchById
};
