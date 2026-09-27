const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const Claim = require('../models/Claim');
const ReturnRecord = require('../models/ReturnRecord');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalLost = await LostItem.countDocuments();
    const totalFound = await FoundItem.countDocuments();

    const pendingLost = await LostItem.countDocuments({ status: 'PENDING_REVIEW' });
    const pendingFound = await FoundItem.countDocuments({ status: 'PENDING_REVIEW' });
    const pendingReports = pendingLost + pendingFound;

    const possibleMatches = await Match.countDocuments({ score: { $gte: 50 } });
    const pendingClaims = await Claim.countDocuments({ status: 'PENDING_REVIEW' });

    const returnedLost = await LostItem.countDocuments({ status: 'RETURNED' });
    const returnedFound = await FoundItem.countDocuments({ status: 'RETURNED' });
    const itemsReturned = Math.max(returnedLost, returnedFound);

    const unresolvedItems = (totalLost + totalFound) - (returnedLost + returnedFound);

    // Aggregations for charts: Category distribution
    const categoryStats = await LostItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Location distribution
    const locationStats = await FoundItem.aggregate([
      { $group: { _id: '$locationName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Recent activity
    const recentLost = await LostItem.find().sort({ createdAt: -1 }).limit(4).populate('userId', 'name email');
    const recentFound = await FoundItem.find().sort({ createdAt: -1 }).limit(4).populate('userId', 'name email');
    const recentClaims = await Claim.find().sort({ createdAt: -1 }).limit(4).populate('claimantUserId', 'name studentId').populate('foundItemId', 'itemName');

    return res.status(200).json({
      success: true,
      stats: {
        totalLost,
        totalFound,
        pendingReports,
        possibleMatches,
        pendingClaims,
        itemsReturned,
        unresolvedItems: Math.max(0, unresolvedItems)
      },
      charts: {
        categories: categoryStats.map(c => ({ category: c._id || 'Unspecified', count: c.count })),
        locations: locationStats.map(l => ({ location: l._id || 'General Area', count: l.count }))
      },
      recent: {
        lost: recentLost,
        found: recentFound,
        claims: recentClaims
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard stats',
      error: error.message
    });
  }
};

// GET /api/admin/reports
const getAllReports = async (req, res) => {
  try {
    const { status, type } = req.query;
    let lost = [];
    let found = [];

    const query = {};
    if (status) query.status = status;

    if (!type || type === 'all' || type === 'lost') {
      lost = await LostItem.find(query)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email studentId phone');
    }

    if (!type || type === 'all' || type === 'found') {
      found = await FoundItem.find(query)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email studentId phone');
    }

    return res.status(200).json({
      success: true,
      lost: lost.map(i => ({ ...i.toObject(), reportType: 'LOST' })),
      found: found.map(i => ({ ...i.toObject(), reportType: 'FOUND' }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin reports',
      error: error.message
    });
  }
};

// PUT /api/admin/reports/:id/approve
const approveReport = async (req, res) => {
  try {
    const { type } = req.body; // 'LOST' or 'FOUND'
    let item;

    if (type === 'LOST') {
      item = await LostItem.findByIdAndUpdate(
        req.params.id,
        { status: 'APPROVED' },
        { new: true }
      ).populate('userId', 'name email');
    } else {
      item = await FoundItem.findByIdAndUpdate(
        req.params.id,
        { status: 'APPROVED' },
        { new: true }
      ).populate('userId', 'name email');
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (item.userId) {
      await createNotification({
        userId: item.userId._id,
        type: 'REPORT_APPROVED',
        title: 'Report Approved by Admin',
        message: `Your report for "${item.itemName}" has been verified and approved for campus-wide matching.`,
        relatedItemId: item._id,
        relatedItemType: type === 'LOST' ? 'LostItem' : 'FoundItem'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report approved successfully',
      item
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to approve report',
      error: error.message
    });
  }
};

// PUT /api/admin/reports/:id/reject
const rejectReport = async (req, res) => {
  try {
    const { type, reason } = req.body;
    let item;

    if (type === 'LOST') {
      item = await LostItem.findByIdAndUpdate(
        req.params.id,
        { status: 'CLOSED' },
        { new: true }
      );
    } else {
      item = await FoundItem.findByIdAndUpdate(
        req.params.id,
        { status: 'CLOSED' },
        { new: true }
      );
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Report status closed/rejected.',
      item
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject report',
      error: error.message
    });
  }
};

// PUT /api/admin/claims/:id/approve
const approveClaim = async (req, res) => {
  try {
    const { notes } = req.body;
    const claim = await Claim.findById(req.params.id)
      .populate('foundItemId')
      .populate('lostItemId')
      .populate('claimantUserId');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = 'APPROVED';
    claim.adminNotes = notes || 'Ownership verified through identifying features.';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    // Update Found and Lost items to CLAIM_APPROVED
    if (claim.foundItemId) {
      claim.foundItemId.status = 'CLAIM_APPROVED';
      await claim.foundItemId.save();
    }

    if (claim.lostItemId) {
      claim.lostItemId.status = 'CLAIM_APPROVED';
      await claim.lostItemId.save();
    }

    // Notify claimant
    await createNotification({
      userId: claim.claimantUserId._id,
      type: 'CLAIM_APPROVED',
      title: 'Ownership Claim Approved! 🎉',
      message: `Your ownership claim for "${claim.foundItemId?.itemName || 'item'}" has been approved! Please visit the Campus Security Office for handover verification.`,
      relatedItemId: claim.foundItemId?._id,
      relatedItemType: 'FoundItem',
      relatedClaimId: claim._id
    });

    return res.status(200).json({
      success: true,
      message: 'Claim approved successfully. Ready for handover.',
      claim
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to approve claim',
      error: error.message
    });
  }
};

// PUT /api/admin/claims/:id/reject
const rejectClaim = async (req, res) => {
  try {
    const { reason } = req.body;
    const claim = await Claim.findById(req.params.id)
      .populate('foundItemId')
      .populate('lostItemId')
      .populate('claimantUserId');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = 'REJECTED';
    claim.adminNotes = reason || 'Identifying features do not match reported item.';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    // Reset items to searching / matching
    if (claim.foundItemId) {
      claim.foundItemId.status = 'MATCHING';
      await claim.foundItemId.save();
    }
    if (claim.lostItemId) {
      claim.lostItemId.status = 'SEARCHING';
      await claim.lostItemId.save();
    }

    // Notify claimant
    await createNotification({
      userId: claim.claimantUserId._id,
      type: 'CLAIM_REJECTED',
      title: 'Claim Update: Verification Unsuccessful',
      message: `Your claim for "${claim.foundItemId?.itemName || 'item'}" was not approved: ${reason || 'Verification details did not match.'}`,
      relatedItemId: claim.foundItemId?._id,
      relatedItemType: 'FoundItem',
      relatedClaimId: claim._id
    });

    return res.status(200).json({
      success: true,
      message: 'Claim rejected.',
      claim
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject claim',
      error: error.message
    });
  }
};

// PUT /api/admin/items/:id/returned (Handover completion)
const recordHandover = async (req, res) => {
  try {
    const { claimId, handoverLocation, storageRefNumber, notes } = req.body;
    const itemId = req.params.id;

    // Check either lost or found item
    let foundItem = await FoundItem.findById(itemId);
    let lostItem;

    if (!foundItem) {
      lostItem = await LostItem.findById(itemId);
    }

    let claim;
    if (claimId) {
      claim = await Claim.findById(claimId).populate('claimantUserId');
    } else if (foundItem) {
      claim = await Claim.findOne({ foundItemId: foundItem._id, status: 'APPROVED' }).populate('claimantUserId');
    }

    if (foundItem) {
      foundItem.status = 'RETURNED';
      if (storageRefNumber) foundItem.storageRefNumber = storageRefNumber;
      await foundItem.save();
    }

    if (claim && claim.lostItemId) {
      lostItem = await LostItem.findById(claim.lostItemId);
    }

    if (lostItem) {
      lostItem.status = 'RETURNED';
      await lostItem.save();
    }

    if (claim) {
      claim.status = 'RETURNED';
      await claim.save();
    }

    // Create ReturnRecord
    const returnRecord = await ReturnRecord.create({
      claimId: claim ? claim._id : undefined,
      foundItemId: foundItem ? foundItem._id : undefined,
      lostItemId: lostItem ? lostItem._id : undefined,
      adminId: req.user._id,
      handoverLocation: handoverLocation || 'Campus Security Office (Ground Floor)',
      storageRefNumber: storageRefNumber || (foundItem ? foundItem.storageRefNumber : 'SEC-HANDOVER'),
      returnedDate: new Date(),
      notes: notes || 'Item successfully verified and handed over to owner.'
    });

    // Notify the claimant / owner
    const targetUserId = claim?.claimantUserId?._id || lostItem?.userId || foundItem?.userId;
    if (targetUserId) {
      await createNotification({
        userId: targetUserId,
        type: 'ITEM_RETURNED',
        title: 'Item Successfully Returned! 🎉',
        message: `Your item "${foundItem?.itemName || lostItem?.itemName || 'Item'}" has been officially marked as RETURNED. Thank you for using CampusFind!`,
        relatedItemId: foundItem?._id || lostItem?._id,
        relatedItemType: foundItem ? 'FoundItem' : 'LostItem',
        relatedClaimId: claim?._id
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Handover finalized! Item marked as RETURNED.',
      returnRecord
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record handover',
      error: error.message
    });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllReports,
  approveReport,
  rejectReport,
  approveClaim,
  rejectClaim,
  recordHandover,
  getUsers
};
