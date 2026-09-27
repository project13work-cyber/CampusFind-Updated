const CampusLocation = require('../models/CampusLocation');
const { CANTEEN_ZONES } = require('../config/constants');

// GET /api/locations
const getLocations = async (req, res) => {
  try {
    let locations = await CampusLocation.find({ active: true });

    // If database is not seeded yet, return default Canteen structure
    if (locations.length === 0) {
      locations = [
        {
          _id: 'default_canteen',
          name: 'College Canteen',
          code: 'CANTEEN',
          description: 'Main Campus Dining Hall & Cafeteria (Ground Floor)',
          building: 'Student Amenities Block',
          floor: 'Ground Floor',
          zones: CANTEEN_ZONES,
          mapType: 'custom_floorplan',
          active: true
        }
      ];
    }

    return res.status(200).json({
      success: true,
      locations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campus locations',
      error: error.message
    });
  }
};

// POST /api/locations (Admin)
const createLocation = async (req, res) => {
  try {
    const { name, code, description, building, floor, zones } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and Code are required' });
    }

    const location = await CampusLocation.create({
      name,
      code,
      description,
      building,
      floor,
      zones: zones || CANTEEN_ZONES
    });

    return res.status(201).json({
      success: true,
      message: 'Campus location created successfully',
      location
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create campus location',
      error: error.message
    });
  }
};

module.exports = {
  getLocations,
  createLocation
};
