const mongoose = require('mongoose');
const { CLAIM_STATUSES } = require('../config/constants');

const claimSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true
    },
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem'
    },
    claimantUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: {
      whereLost: {
        type: String,
        required: [true, 'Please state where you believe the item was lost']
      },
      uniqueFeatures: {
        type: String,
        required: [true, 'Please describe any unique identifying features of your item']
      },
      insideOrAttached: {
        type: String,
        required: [true, 'Please specify any contents inside or accessories attached']
      }
    },
    proofImages: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: CLAIM_STATUSES,
      default: 'PENDING_REVIEW'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
