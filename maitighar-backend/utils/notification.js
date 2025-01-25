const User = require("../models/user");

const addNotification = async (userId, issueId, message, metadata = {}) => {
  try {
    const notification = {
      message,
      ...metadata,
      timestamp: new Date(),
      read: false,
      issue: issueId,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { notifications: notification } },
      { new: true }, // Return the updated document
    );

    if (!updatedUser) {
      console.error(`User not found with ID: ${userId}`);
      throw new Error("User not found");
    }

    console.log("Notification added successfully:", updatedUser.notifications);
  } catch (error) {
    console.error("Error in addNotification function:", error);
    throw error; // Re-throw the error to propagate it to the endpoint
  }
};

module.exports = { addNotification };
