const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    bounds: {
      xMin: { type: Number, default: 0 },
      xMax: { type: Number, default: 1000 },
      yMin: { type: Number, default: 0 },
      yMax: { type: Number, default: 1000 }
    }
  },
  { _id: false }
);

const campusLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      uppercase: true
    },
    description: String,
    building: String,
    floor: String,
    zones: [zoneSchema],
    mapType: {
      type: String,
      enum: ['custom_floorplan', 'svg_coordinates', 'grid'],
      default: 'custom_floorplan'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const CampusLocation = mongoose.model('CampusLocation', campusLocationSchema);

module.exports = CampusLocation;
