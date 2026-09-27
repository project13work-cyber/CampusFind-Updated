const mongoose = require('mongoose');

const returnRecordSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: true
    },
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem'
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    handoverLocation: {
      type: String,
      required: true,
      default: 'Campus Security Office (Ground Floor)'
    },
    storageRefNumber: {
      type: String,
      default: ''
    },
    returnedDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const ReturnRecord = mongoose.model('ReturnRecord', returnRecordSchema);

module.exports = ReturnRecord;
