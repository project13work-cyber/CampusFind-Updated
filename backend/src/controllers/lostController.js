const LostItem = require('../models/LostItem');
const { runMatchingForLostItem } = require('../services/matchingEngine');

// POST /api/lost
const createLostItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      brand,
      model,
      color,
      quantity,
      description,
      lostDate,
      approxTime,
      timeRange,
      locationId,
      locationName,
      zone,
      mapCoordinates,
      exactSpot,
      privateIdentifier
    } = req.body;

    if (!itemName || !category || !lostDate || !locationName) {
      return res.status(400).json({
        success: false,
        message: 'Item name, category, lost date, and campus location are required.'
      });
    }

    let parsedCoords = { x: 500, y: 300 };
    if (mapCoordinates) {
      try {
        parsedCoords = typeof mapCoordinates === 'string' ? JSON.parse(mapCoordinates) : mapCoordinates;
      } catch (e) {
        parsedCoords = { x: 500, y: 300 };
      }
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    const lostItem = await LostItem.create({
      userId: req.user._id,
      itemName: itemName.trim(),
      category,
      brand: brand ? brand.trim() : '',
      model: model ? model.trim() : '',
      color: color ? color.trim() : '',
      quantity: quantity ? parseInt(quantity, 10) : 1,
      description: description ? description.trim() : '',
      images,
      lostDate: new Date(lostDate),
      approxTime: approxTime ? approxTime.trim() : '',
      timeRange: timeRange ? timeRange.trim() : '',
      locationId: locationId || undefined,
      locationName: locationName.trim(),
      zone: zone ? zone.trim() : 'General Area',
      mapCoordinates: parsedCoords,
      exactSpot: exactSpot ? exactSpot.trim() : '',
      privateIdentifier: privateIdentifier ? privateIdentifier.trim() : '',
      status: 'REPORTED'
    });

    // Run matching engine asynchronously
    runMatchingForLostItem(lostItem._id).catch(err => {
      console.error('[LostController] Error running match engine:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Lost item reported successfully.',
      item: lostItem
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to report lost item.',
      error: error.message
    });
  }
};

// GET /api/lost
const getLostItems = async (req, res) => {
  try {
    const { category, color, status, location, search, myItems } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (color) filter.color = new RegExp(color, 'i');
    if (status) filter.status = status;
    if (location) filter.locationName = new RegExp(location, 'i');

    if (myItems === 'true' && req.user) {
      filter.userId = req.user._id;
    }

    if (search) {
      filter.$or = [
        { itemName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { color: new RegExp(search, 'i') },
        { exactSpot: new RegExp(search, 'i') }
      ];
    }

    const items = await LostItem.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name studentId');

    // Securely strip privateIdentifier and contact info for other users
    const sanitizedItems = items.map(item => {
      const isOwnerOrAdmin = req.user && (
        req.user.role === 'ADMIN' ||
        (item.userId && item.userId._id.toString() === req.user._id.toString())
      );

      const obj = item.toObject();
      if (!isOwnerOrAdmin) {
        delete obj.privateIdentifier;
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: sanitizedItems.length,
      items: sanitizedItems
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching lost items.',
      error: error.message
    });
  }
};

// GET /api/lost/:id
const getLostItemById = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id).populate('userId', 'name studentId');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost item report not found.'
      });
    }

    const isOwnerOrAdmin = req.user && (
      req.user.role === 'ADMIN' ||
      (item.userId && item.userId._id.toString() === req.user._id.toString())
    );

    const obj = item.toObject();
    if (!isOwnerOrAdmin) {
      delete obj.privateIdentifier;
    }

    return res.status(200).json({
      success: true,
      item: obj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching item details.',
      error: error.message
    });
  }
};

// PUT /api/lost/:id
const updateLostItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    const isOwner = item.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this report.'
      });
    }

    const updatableFields = [
      'itemName', 'category', 'brand', 'model', 'color', 'quantity',
      'description', 'lostDate', 'approxTime', 'timeRange', 'locationName',
      'zone', 'exactSpot', 'privateIdentifier', 
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (req.body.mapCoordinates) {
      try {
        item.mapCoordinates = typeof req.body.mapCoordinates === 'string'
          ? JSON.parse(req.body.mapCoordinates)
          : req.body.mapCoordinates;
      } catch (e) {}
    }

    if (req.files && req.files.length > 0) {
      req.files.forEach(f => item.images.push(`/uploads/${f.filename}`));
    }

    await item.save();

    // Re-run matching
    runMatchingForLostItem(item._id).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      item
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating report.',
      error: error.message
    });
  }
};

// DELETE /api/lost/:id
const deleteLostItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    const isOwner = item.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report.'
      });
    }

    await LostItem.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting report.',
      error: error.message
    });
  }
};

module.exports = {
  createLostItem,
  getLostItems,
  getLostItemById,
  updateLostItem,
  deleteLostItem
};
