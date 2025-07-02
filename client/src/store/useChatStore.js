import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { AArrowDown } from "lucide-react";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessageLoading: false,

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
      set({ message: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessageLoading: false });
    }
  },
  // optimize this one letter
  sendMessage: async (messageData) => {
    const { messages, selectedUser } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id} `,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
