const mongoose = require('mongoose');
const { CATEGORIES, FOUND_STATUSES, CURRENT_ITEM_LOCATIONS } = require('../config/constants');

const foundItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [120, 'Item name cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES
    },
    brand: {
      type: String,
      trim: true,
      default: ''
    },
    model: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    images: [
      {
        type: String
      }
    ],
    foundDate: {
      type: Date,
      required: [true, 'Found date is required']
    },
    foundTime: {
      type: String,
      trim: true,
      default: ''
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampusLocation'
    },
    locationName: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true
    },
    zone: {
      type: String,
      trim: true,
      default: 'General Area'
    },
    mapCoordinates: {
      x: { type: Number, default: 500 },
      y: { type: Number, default: 300 }
    },
    exactSpot: {
      type: String,
      trim: true,
      default: ''
    },
    currentLocation: {
      type: String,
      enum: CURRENT_ITEM_LOCATIONS,
      default: 'With me'
    },
    storageRefNumber: {
      type: String,
      trim: true,
      default: ''
    },
    privateIdentifier: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: FOUND_STATUSES,
      default: 'REPORTED'
    }
  },
  {
    timestamps: true
  }
);

foundItemSchema.index({ itemName: 'text', description: 'text', brand: 'text', color: 'text' });

const FoundItem = mongoose.model('FoundItem', foundItemSchema);

module.exports = FoundItem;
