import { handleServerError } from "../lib/utils.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    // Check if trying to send request to self
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "Cannot send friend request to yourself" });
    }

    // Find both users
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if users are blocked
    if (sender.blockedUsers.includes(receiverId) || receiver.blockedUsers.includes(senderId)) {
      return res.status(400).json({ error: "Cannot send friend request to blocked user" });
    }

    // Check if already friends
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ error: "Already friends" });
    }

    // Check if request already sent
    if (sender.sentRequests.some(req => req.to.toString() === receiverId)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Check if receiver has already sent a request (mutual request)
    if (receiver.sentRequests.some(req => req.to.toString() === senderId)) {
      return res.status(400).json({ error: "User has already sent you a friend request" });
    }

    // Check receiver's privacy settings for friend requests
    const allowFriendRequestsFrom = receiver.privacySettings?.allowFriendRequestsFrom || "everyone";
    
    if (allowFriendRequestsFrom === "nobody") {
      return res.status(403).json({ error: "User is not accepting friend requests" });
    }

    // Add to sender's sent requests
    sender.sentRequests.push({ to: receiverId });
    
    // Add to receiver's friend requests
    receiver.friendRequests.push({ from: senderId });

    await Promise.all([sender.save(), receiver.save()]);

    // Send real-time notification
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      const senderInfo = {
        _id: sender._id,
        fullName: sender.fullName,
        profilePic: sender.profilePic,
      };
      io.to(receiverSocketId).emit("friendRequestReceived", {
        from: senderInfo,
        createdAt: new Date(),
      });
    }

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    handleServerError(res, error, "sendFriendRequest controller");
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    // Find both users
    const [receiver, sender] = await Promise.all([
      User.findById(receiverId),
      User.findById(senderId)
    ]);

    if (!sender) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if request exists
    const requestIndex = receiver.friendRequests.findIndex(
      req => req.from.toString() === senderId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    // Remove request from receiver's friendRequests
    receiver.friendRequests.splice(requestIndex, 1);

    // Remove from sender's sentRequests
    const sentRequestIndex = sender.sentRequests.findIndex(
      req => req.to.toString() === receiverId
    );
    if (sentRequestIndex !== -1) {
      sender.sentRequests.splice(sentRequestIndex, 1);
    }

    // Add to both users' friends list
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    await Promise.all([receiver.save(), sender.save()]);

    // Send real-time notification
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      const receiverInfo = {
        _id: receiver._id,
        fullName: receiver.fullName,
        profilePic: receiver.profilePic,
      };
      io.to(senderSocketId).emit("friendRequestAccepted", {
        by: receiverInfo,
        createdAt: new Date(),
      });
    }

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    handleServerError(res, error, "acceptFriendRequest controller");
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    // Find both users
    const [receiver, sender] = await Promise.all([
      User.findById(receiverId),
      User.findById(senderId)
    ]);

    if (!sender) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if request exists
    const requestIndex = receiver.friendRequests.findIndex(
      req => req.from.toString() === senderId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    // Remove request from receiver's friendRequests
    receiver.friendRequests.splice(requestIndex, 1);

    // Remove from sender's sentRequests
    const sentRequestIndex = sender.sentRequests.findIndex(
      req => req.to.toString() === receiverId
    );
    if (sentRequestIndex !== -1) {
      sender.sentRequests.splice(sentRequestIndex, 1);
    }

    await Promise.all([receiver.save(), sender.save()]);

    res.status(200).json({ message: "Friend request rejected successfully" });
  } catch (error) {
    handleServerError(res, error, "rejectFriendRequest controller");
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const { targetId } = req.params;
    const userId = req.user._id;

    // Check if trying to block self
    if (userId.toString() === targetId) {
      return res.status(400).json({ error: "Cannot block yourself" });
    }

    const [user, target] = await Promise.all([
      User.findById(userId),
      User.findById(targetId)
    ]);

    if (!target) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already blocked
    if (user.blockedUsers.includes(targetId)) {
      return res.status(400).json({ error: "User already blocked" });
    }

    // Add to blocked users
    user.blockedUsers.push(targetId);

    // Remove from friends if they are friends
    user.friends = user.friends.filter(friendId => friendId.toString() !== targetId);
    target.friends = target.friends.filter(friendId => friendId.toString() !== userId);

    // Remove any pending friend requests between them
    user.friendRequests = user.friendRequests.filter(req => req.from.toString() !== targetId);
    user.sentRequests = user.sentRequests.filter(req => req.to.toString() !== targetId);
    target.friendRequests = target.friendRequests.filter(req => req.from.toString() !== userId);
    target.sentRequests = target.sentRequests.filter(req => req.to.toString() !== userId);

    await Promise.all([user.save(), target.save()]);

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    handleServerError(res, error, "blockUser controller");
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const { targetId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user.blockedUsers.includes(targetId)) {
      return res.status(400).json({ error: "User is not blocked" });
    }

    // Remove from blocked users
    user.blockedUsers = user.blockedUsers.filter(blockedId => blockedId.toString() !== targetId);

    await user.save();

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    handleServerError(res, error, "unblockUser controller");
  }
};

// Get friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("friendRequests.from", "fullName profilePic email")
      .populate("sentRequests.to", "fullName profilePic email");

    res.status(200).json({
      received: user.friendRequests,
      sent: user.sentRequests,
    });
  } catch (error) {
    handleServerError(res, error, "getFriendRequests controller");
  }
};

// Get friends list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("friends", "fullName profilePic email")
      .populate("blockedUsers", "fullName profilePic email");

    res.status(200).json({
      friends: user.friends,
      blocked: user.blockedUsers,
    });
  } catch (error) {
    handleServerError(res, error, "getFriends controller");
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId)
    ]);

    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if they are friends
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ error: "Not friends with this user" });
    }

    // Remove from both users' friends list
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== userId);

    await Promise.all([user.save(), friend.save()]);

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    handleServerError(res, error, "removeFriend controller");
  }
};
