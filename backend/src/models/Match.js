const mongoose = require('mongoose');
const { MATCH_STATUSES } = require('../config/constants');

const matchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: true
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    matchLevel: {
      type: String,
      enum: ['Very High', 'High', 'Possible', 'Low'],
      default: 'Possible'
    },
    matchingFactors: {
      locationScore: { type: Number, default: 0 },
      categoryScore: { type: Number, default: 0 },
      dateTimeScore: { type: Number, default: 0 },
      colorScore: { type: Number, default: 0 },
      brandScore: { type: Number, default: 0 },
      descriptionScore: { type: Number, default: 0 },
      imageScore: { type: Number, default: 0 },
      details: [{ type: String }]
    },
    status: {
      type: String,
      enum: MATCH_STATUSES,
      default: 'POTENTIAL'
    }
  },
  {
    timestamps: true
  }
);

matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
