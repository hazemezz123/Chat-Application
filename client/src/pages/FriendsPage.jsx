import React, { useEffect, useState } from "react";
import { useFriendsStore } from "../store/useFriendsStore";
import { motion } from "framer-motion";
import {
  UserPlus,
  UserCheck,
  Users,
  Check,
  X,
  Shield,
  ShieldOff,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const FriendsPage = () => {
  const {
    friends,
    blockedUsers,
    friendRequests,
    isLoading,
    getFriends,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    unblockUser,
  } = useFriendsStore();

  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    getFriends();
    getFriendRequests();
  }, [getFriends, getFriendRequests]);

  const tabs = [
    {
      id: "requests",
      label: "Friend Requests",
      icon: UserPlus,
      count: friendRequests.received.length,
    },
    { id: "friends", label: "Friends", icon: UserCheck, count: friends.length },
    {
      id: "blocked",
      label: "Blocked",
      icon: Shield,
      count: blockedUsers.length,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "requests":
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold mb-3">Received Requests</h3>
            {friendRequests.received.length === 0 ? (
              <div className="text-center py-6 text-base-content/60">
                <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending friend requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendRequests.received.map((request) => (
                  <motion.div
                    key={request.from._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={request.from.profilePic || "/avatar.png"}
                        alt={request.from.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-medium">{request.from.fullName}</h4>
                        <p className="text-xs text-base-content/70">
                          {request.from.email}
                        </p>
                        <p className="text-xs text-base-content/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(request.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(request.from._id)}
                        className="btn btn-success btn-xs text-xs"
                        disabled={isLoading}
                      >
                        <Check className="w-3 h-3" />
                        Accept
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(request.from._id)}
                        className="btn btn-error btn-xs text-xs"
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <h3 className="text-base font-semibold mb-3 mt-6">Sent Requests</h3>
            {friendRequests.sent.length === 0 ? (
              <div className="text-center py-6 text-base-content/60">
                <p className="text-sm">No pending sent requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendRequests.sent.map((request) => (
                  <motion.div
                    key={request.to._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={request.to.profilePic || "/avatar.png"}
                        alt={request.to.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-medium">{request.to.fullName}</h4>
                        <p className="text-xs text-base-content/70">
                          {request.to.email}
                        </p>
                        <p className="text-xs text-base-content/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(request.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-info">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">Pending</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case "friends":
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold mb-3">Your Friends</h3>
            {friends.length === 0 ? (
              <div className="text-center py-6 text-base-content/60">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No friends yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <motion.div
                    key={friend._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={friend.profilePic || "/avatar.png"}
                        alt={friend.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-medium">{friend.fullName}</h4>
                        <p className="text-xs text-base-content/70">
                          {friend.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFriend(friend._id)}
                      className="btn btn-error btn-xs text-xs"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case "blocked":
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold mb-3">Blocked Users</h3>
            {blockedUsers.length === 0 ? (
              <div className="text-center py-6 text-base-content/60">
                <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No blocked users</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-medium">{user.fullName}</h4>
                        <p className="text-xs text-base-content/70">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => unblockUser(user._id)}
                      className="btn btn-warning btn-xs text-xs"
                      disabled={isLoading}
                    >
                      <ShieldOff className="w-3 h-3" />
                      Unblock
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className=" min-h-[100dvh] bg-base-200 pt-16 ">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-base-100 rounded-lg shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary text-primary-content p-4 border-b-2 border-primary-content">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Friends Management
            </h1>
            <p className="mt-1 text-sm opacity-90">
              Manage your friends, friend requests, and blocked users
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-base-300">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-center text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="badge badge-xs text-xs">{tab.count}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="loading loading-spinner loading-md"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FriendsPage;
