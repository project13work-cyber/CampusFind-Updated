const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'MATCH_FOUND',
        'CLAIM_SUBMITTED',
        'CLAIM_APPROVED',
        'CLAIM_REJECTED',
        'REPORT_APPROVED',
        'ITEM_RETURNED',
        'INFO_REQUESTED'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedItemId: {
      type: mongoose.Schema.Types.ObjectId
    },
    relatedItemType: {
      type: String,
      enum: ['LostItem', 'FoundItem']
    },
    relatedMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    relatedClaimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
