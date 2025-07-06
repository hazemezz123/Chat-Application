import { handleServerError } from "../lib/utils.js";
import User from "../models/user.model.js";

// Get user privacy settings
export const getPrivacySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("privacySettings");
    
    res.status(200).json({
      privacySettings: user.privacySettings || {
        allowMessagesFrom: "everyone",
        allowFriendRequestsFrom: "everyone",
        showOnlineStatus: true,
        showLastSeen: true
      }
    });
  } catch (error) {
    handleServerError(res, error, "getPrivacySettings controller");
  }
};

// Update user privacy settings
export const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { privacySettings } = req.body;

    // Validate settings
    const validAllowMessagesFrom = ["everyone", "friends", "nobody"];
    const validAllowFriendRequestsFrom = ["everyone", "nobody"];

    if (privacySettings.allowMessagesFrom && !validAllowMessagesFrom.includes(privacySettings.allowMessagesFrom)) {
      return res.status(400).json({ error: "Invalid allowMessagesFrom value" });
    }

    if (privacySettings.allowFriendRequestsFrom && !validAllowFriendRequestsFrom.includes(privacySettings.allowFriendRequestsFrom)) {
      return res.status(400).json({ error: "Invalid allowFriendRequestsFrom value" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          "privacySettings.allowMessagesFrom": privacySettings.allowMessagesFrom || "everyone",
          "privacySettings.allowFriendRequestsFrom": privacySettings.allowFriendRequestsFrom || "everyone",
          "privacySettings.showOnlineStatus": privacySettings.showOnlineStatus !== undefined ? privacySettings.showOnlineStatus : true,
          "privacySettings.showLastSeen": privacySettings.showLastSeen !== undefined ? privacySettings.showLastSeen : true,
        }
      },
      { new: true, select: "privacySettings" }
    );

    res.status(200).json({
      message: "Privacy settings updated successfully",
      privacySettings: user.privacySettings
    });
  } catch (error) {
    handleServerError(res, error, "updatePrivacySettings controller");
  }
};

// Reset privacy settings to default
export const resetPrivacySettings = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          "privacySettings.allowMessagesFrom": "everyone",
          "privacySettings.allowFriendRequestsFrom": "everyone",
          "privacySettings.showOnlineStatus": true,
          "privacySettings.showLastSeen": true,
        }
      },
      { new: true, select: "privacySettings" }
    );

    res.status(200).json({
      message: "Privacy settings reset to default",
      privacySettings: user.privacySettings
    });
  } catch (error) {
    handleServerError(res, error, "resetPrivacySettings controller");
  }
};
