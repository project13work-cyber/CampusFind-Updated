const mongoose = require('mongoose');
const { CATEGORIES, LOST_STATUSES } = require('../config/constants');

const lostItemSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      default: 1,
      min: 1
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
    lostDate: {
      type: Date,
      required: [true, 'Lost date is required']
    },
    approxTime: {
      type: String,
      trim: true,
      default: ''
    },
    timeRange: {
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
    // Sensitive verification detail - visible only to item creator and admin during claim
    privateIdentifier: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: LOST_STATUSES,
      default: 'REPORTED'
    }
  },
  {
    timestamps: true
  }
);

lostItemSchema.index({ itemName: 'text', description: 'text', brand: 'text', color: 'text' });

const LostItem = mongoose.model('LostItem', lostItemSchema);

module.exports = LostItem;
