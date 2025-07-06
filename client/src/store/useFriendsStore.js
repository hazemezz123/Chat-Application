import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useFriendsStore = create((set, get) => ({
  friends: [],
  blockedUsers: [],
  friendRequests: { received: [], sent: [] },
  isLoading: false,

  // Get friends and blocked users
  getFriends: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ 
        friends: res.data.friends, 
        blockedUsers: res.data.blocked,
        isLoading: false 
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch friends");
      set({ isLoading: false });
    }
  },

  // Get friend requests
  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ friendRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch friend requests");
    }
  },

  // Send friend request
  sendFriendRequest: async (receiverId) => {
    try {
      await axiosInstance.post(`/friends/request/${receiverId}`);
      toast.success("Friend request sent successfully");
      
      // Update state immediately
      const { friendRequests } = get();
      set({
        friendRequests: {
          ...friendRequests,
          sent: [...friendRequests.sent, { to: { _id: receiverId }, createdAt: new Date() }]
        }
      });
      
      // Refresh the sent requests to get full user data
      get().getFriendRequests();
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send friend request");
      return false;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (senderId) => {
    try {
      await axiosInstance.post(`/friends/accept/${senderId}`);
      toast.success("Friend request accepted");
      
      // Update state immediately
      const { friendRequests, friends } = get();
      
      // Find and move the user from requests to friends
      const acceptedRequest = friendRequests.received.find(req => req.from._id === senderId);
      if (acceptedRequest) {
        // Add to friends
        set({
          friends: [...friends, acceptedRequest.from],
          friendRequests: {
            ...friendRequests,
            received: friendRequests.received.filter(req => req.from._id !== senderId)
          }
        });
      }
      
      // Refresh data to ensure sync
      get().getFriends();
      get().getFriendRequests();
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to accept friend request");
      return false;
    }
  },

  // Reject friend request
  rejectFriendRequest: async (senderId) => {
    try {
      await axiosInstance.post(`/friends/reject/${senderId}`);
      toast.success("Friend request rejected");
      
      // Update state immediately
      const { friendRequests } = get();
      set({
        friendRequests: {
          ...friendRequests,
          received: friendRequests.received.filter(req => req.from._id !== senderId)
        }
      });
      
      // Refresh friend requests to ensure sync
      get().getFriendRequests();
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject friend request");
      return false;
    }
  },

  // Block user
  blockUser: async (targetId) => {
    try {
      await axiosInstance.post(`/friends/block/${targetId}`);
      toast.success("User blocked successfully");
      
      // Refresh data
      get().getFriends();
      get().getFriendRequests();
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to block user");
      return false;
    }
  },

  // Unblock user
  unblockUser: async (targetId) => {
    try {
      await axiosInstance.post(`/friends/unblock/${targetId}`);
      toast.success("User unblocked successfully");
      
      // Refresh blocked users
      get().getFriends();
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to unblock user");
      return false;
    }
  },

  // Remove friend
  removeFriend: async (friendId) => {
    try {
      await axiosInstance.delete(`/friends/${friendId}`);
      toast.success("Friend removed successfully");
      
      // Refresh friends list
      get().getFriends();
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove friend");
      return false;
    }
  },

  // Socket event handlers
  handleFriendRequestReceived: (data) => {
    const { friendRequests } = get();
    set({
      friendRequests: {
        ...friendRequests,
        received: [...friendRequests.received, data]
      }
    });
    toast.success(`Friend request received from ${data.from.fullName}`);
  },

  handleFriendRequestAccepted: (data) => {
    const { friends } = get();
    set({
      friends: [...friends, data.by]
    });
    toast.success(`${data.by.fullName} accepted your friend request`);
  },

  // Check if user is friend
  isFriend: (userId) => {
    const { friends } = get();
    return friends.some(friend => friend._id === userId);
  },

  // Check if user is blocked
  isBlocked: (userId) => {
    const { blockedUsers } = get();
    return blockedUsers.some(user => user._id === userId);
  },

  // Check friend request status
  getFriendRequestStatus: (userId) => {
    const { friendRequests } = get();
    
    if (friendRequests.received.some(req => req.from._id === userId)) {
      return 'requestReceived';
    }
    
    if (friendRequests.sent.some(req => req.to._id === userId)) {
      return 'requestSent';
    }
    
    return 'none';
  },

  // Get relationship status with a user
  getRelationshipStatus: (userId) => {
    if (get().isFriend(userId)) return 'friends';
    if (get().isBlocked(userId)) return 'blocked';
    return get().getFriendRequestStatus(userId);
  },
}));
