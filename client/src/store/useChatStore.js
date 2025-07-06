import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessageLoading: false,
  isSubscribed: false,
  unreadMessages: [], // Array of unread message notifications

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data.filteredUsers });
      console.log(res.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // Mark messages as seen after fetching
      const socket = useAuthStore.getState().socket;
      const authUser = useAuthStore.getState().authUser;
      if (socket && authUser?._id && userId) {
        socket.emit("markMessagesAsSeen", {
          senderId: userId,
          receiverId: authUser._id,
        });
      }
      // Reset unread count for this user
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? { ...user, unreadCount: 0 } : user
        ),
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessageLoading: false });
    }
  },
  // Optimized message sending with better synchronization
  sendMessage: async (messageData) => {
    const { messages, selectedUser } = get();
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const authUser = useAuthStore.getState().authUser;
    
    // Create optimistic message
    const optimisticMessage = {
      _id: tempId,
      ...messageData,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString(),
      isPending: true,
      isSeen: false
    };
    
    // Immediately add optimistic message to UI
    set({ messages: [...messages, optimisticMessage] });
    
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      
      // Replace optimistic message with real message
      set((state) => ({
        messages: state.messages.map(msg => 
          msg._id === tempId ? { ...res.data, isPending: false } : msg
        )
      }));
      
      // Mark messages as seen after sending a new message
      const socket = useAuthStore.getState().socket;
      if (socket && authUser?._id && selectedUser?._id) {
        socket.emit("markMessagesAsSeen", {
          senderId: selectedUser._id,
          receiverId: authUser._id,
        });
      }
    } catch (error) {
      // Remove failed message and show error
      set((state) => ({
        messages: state.messages.filter(msg => msg._id !== tempId)
      }));
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },
  subscribeToMessages: () => {
    const { isSubscribed } = get();
    if (isSubscribed) return;

    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket || !authUser) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();
      const isFromOtherUser = newMessage.senderId !== authUser?._id;
      const isChatOpen =
        selectedUser && newMessage.senderId === selectedUser._id;

      set((state) => {
        // Check if this message is already in our list (to prevent duplicates)
        const messageExists = state.messages.some(msg => 
          msg._id === newMessage._id || 
          (msg.tempId && msg.senderId === newMessage.senderId && 
           Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 1000)
        );

        // If message is from another user and chat is not open, increase unreadCount
        const updatedUsers = state.users.map((user) => {
          if (
            user._id === newMessage.senderId &&
            isFromOtherUser &&
            !isChatOpen
          ) {
            return {
              ...user,
              unreadCount: (user.unreadCount || 0) + 1,
            };
          }
          return user;
        });

        // Add to unread notifications if from another user and chat not open
        const newUnreadMessages = [...state.unreadMessages];
        if (isFromOtherUser && !isChatOpen) {
          const sender = state.users.find(u => u._id === newMessage.senderId);
          newUnreadMessages.push({
            id: newMessage._id,
            senderId: newMessage.senderId,
            senderName: sender?.fullName || 'Unknown',
            senderAvatar: sender?.profilePic || '/avatar.png',
            text: newMessage.text || (newMessage.image ? '[Image]' : '[Message]'),
            timestamp: newMessage.createdAt,
            messageId: newMessage._id
          });
        }

        // Only add message if it doesn't exist and chat is open
        let updatedMessages = state.messages;
        if (isChatOpen && !messageExists) {
          updatedMessages = [...state.messages, newMessage];
        }

        return {
          messages: updatedMessages,
          users: updatedUsers,
          unreadMessages: newUnreadMessages,
        };
      });
    });

    // Handle messages seen event
    socket.on("messagesSeen", ({ senderId, receiverId }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.senderId === senderId && msg.receiverId === receiverId
            ? { ...msg, isSeen: true }
            : msg
        ),
        users: state.users.map((user) =>
          user._id === senderId ? { ...user, unreadCount: 0 } : user
        ),
        unreadMessages: state.unreadMessages.filter(
          (notification) => notification.senderId !== senderId
        ),
      }));
    });

    set({ isSubscribed: true });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesSeen");
    }
    set({ isSubscribed: false });
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  
  getTotalUnreadCount: () => {
    const { users } = get();
    return users.reduce((acc, user) => acc + (user.unreadCount || 0), 0);
  },
  
  clearNotificationsForUser: (userId) => {
    set((state) => ({
      unreadMessages: state.unreadMessages.filter(
        (notification) => notification.senderId !== userId
      ),
    }));
  },
}));
