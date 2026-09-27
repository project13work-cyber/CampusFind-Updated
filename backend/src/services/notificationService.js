const Notification = require('../models/Notification');

const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedItemId = null,
  relatedItemType = null,
  relatedMatchId = null,
  relatedClaimId = null
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedItemId,
      relatedItemType,
      relatedMatchId,
      relatedClaimId
    });
    return notification;
  } catch (error) {
    console.error(`[NotificationService] Error creating notification: ${error.message}`);
    return null;
  }
};

module.exports = {
  createNotification
};
