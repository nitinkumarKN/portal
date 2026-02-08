import Notification from '../models/Notification.js';

export const createNotification = async (userId, type, title, message, relatedId, relatedModel) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel
    });
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      unreadCount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    await Notification.updateMany(
      { 
        _id: { $in: notificationIds },
        userId: req.user._id 
      },
      { isRead: true }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
