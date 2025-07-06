import { handleServerError } from "../lib/utils.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const loggedInUser = await User.findById(loggedInUserId);
    
    // Find all users except the logged-in user and blocked users
    const users = await User.find({
      _id: { 
        $ne: loggedInUserId,
        $nin: loggedInUser.blockedUsers
      },
    }).select("-password");

    // Filter out users who have blocked the current user
    const filteredUsers = users.filter(user => 
      !user.blockedUsers.includes(loggedInUserId)
    );

    // Add unreadCount and relationship status for each user
    const usersWithDetails = await Promise.all(
      filteredUsers.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          isSeen: false,
        });
        
        // Determine relationship status
        let relationshipStatus = 'none';
        if (loggedInUser.friends.includes(user._id)) {
          relationshipStatus = 'friends';
        } else if (loggedInUser.sentRequests.some(req => req.to.toString() === user._id.toString())) {
          relationshipStatus = 'requestSent';
        } else if (loggedInUser.friendRequests.some(req => req.from.toString() === user._id.toString())) {
          relationshipStatus = 'requestReceived';
        }
        
        return {
          ...user.toObject(),
          unreadCount,
          relationshipStatus,
        };
      })
    );
    res.status(200).json({ filteredUsers: usersWithDetails });
  } catch (error) {
    handleServerError(res, error, "getUserForSidebar controller ");
  }
};
export const getMessages = async (req, res) => {
  try {
    const { id: userIdToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userIdToChatId },
        { senderId: userIdToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    handleServerError(res, error, "getMessage controller");
  }
};
export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if users are blocked
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if either user has blocked the other
    if (sender.blockedUsers.includes(receiverId) || receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ error: "Cannot send message to blocked user" });
    }

    // Check receiver's privacy settings
    const allowMessagesFrom = receiver.privacySettings?.allowMessagesFrom || "everyone";
    
    if (allowMessagesFrom === "nobody") {
      return res.status(403).json({ error: "User is not accepting messages" });
    }
    
    if (allowMessagesFrom === "friends" && !receiver.friends.includes(senderId)) {
      return res.status(403).json({ error: "User only accepts messages from friends" });
    }

    let imageUrl;

    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadedResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo || null,
    });

    await newMessage.save();
    // TODO realTile : For socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(200).json(newMessage);
  } catch (error) {
    handleServerError(res, error, "sendMessage controller");
  }
};
