const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

// GET /api/search
const searchItems = async (req, res) => {
  try {
    const {
      q,
      type = 'all', // 'all', 'lost', 'found'
      category,
      color,
      brand,
      location,
      status,
      startDate,
      endDate,
      sortBy = 'recent'
    } = req.query;

    const buildFilter = (isLost) => {
      const filter = {};

      if (status) {
        filter.status = status;
      }

      if (category && category !== 'All') {
        filter.category = category;
      }

      if (color) {
        filter.color = new RegExp(color, 'i');
      }

      if (brand) {
        filter.brand = new RegExp(brand, 'i');
      }

      if (location && location !== 'All') {
        filter.locationName = new RegExp(location, 'i');
      }

      const dateField = isLost ? 'lostDate' : 'foundDate';
      if (startDate || endDate) {
        filter[dateField] = {};
        if (startDate) filter[dateField].$gte = new Date(startDate);
        if (endDate) filter[dateField].$lte = new Date(endDate);
      }

      if (q && q.trim() !== '') {
        const regex = new RegExp(q.trim(), 'i');
        filter.$or = [
          { itemName: regex },
          { description: regex },
          { brand: regex },
          { model: regex },
          { color: regex },
          { exactSpot: regex },
          { locationName: regex },
          { zone: regex }
        ];
      }

      return filter;
    };

    let lostResults = [];
    let foundResults = [];

    if (type === 'all' || type === 'lost') {
      const lostFilter = buildFilter(true);
      const lostDocs = await LostItem.find(lostFilter)
        .populate('userId', 'name studentId')
        .sort({ createdAt: -1 })
        .limit(50);

      lostResults = lostDocs.map(doc => {
        const item = doc.toObject();
        // Hide private identifier and reporter email/phone
        delete item.privateIdentifier;
        return {
          ...item,
          reportType: 'LOST',
          itemDate: item.lostDate
        };
      });
    }

    if (type === 'all' || type === 'found') {
      const foundFilter = buildFilter(false);
      const foundDocs = await FoundItem.find(foundFilter)
        .populate('userId', 'name studentId')
        .sort({ createdAt: -1 })
        .limit(50);

      foundResults = foundDocs.map(doc => {
        const item = doc.toObject();
        delete item.privateIdentifier;
        return {
          ...item,
          reportType: 'FOUND',
          itemDate: item.foundDate
        };
      });
    }

    let combined = [...lostResults, ...foundResults];

    // Sorting
    if (sortBy === 'recent') {
      combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'date') {
      combined.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
    } else if (sortBy === 'name') {
      combined.sort((a, b) => a.itemName.localeCompare(b.itemName));
    }

    return res.status(200).json({
      success: true,
      total: combined.length,
      items: combined
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Search query failed',
      error: error.message
    });
  }
};

module.exports = {
  searchItems
};
