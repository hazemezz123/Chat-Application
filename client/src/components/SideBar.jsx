import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendsStore } from "../store/useFriendsStore";
import SidebarSkeleton from "./Skeleton/SideBarSkeleton";
import FriendActions from "./FriendActions";
import { Users, UserCheck, Shield } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();

  const { onlineUsers, authUser, socket } = useAuthStore();
  const { getFriends, getFriendRequests, getRelationshipStatus } = useFriendsStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'friends', 'blocked'

  useEffect(() => {
    getUsers();
    getFriends();
    getFriendRequests();
  }, [getUsers, getFriends, getFriendRequests]);

  // Filter users based on view mode
  let filteredUsers = users;
  
  // Filter by view mode
  if (viewMode === 'friends') {
    filteredUsers = users.filter(user => user.relationshipStatus === 'friends');
  } else if (viewMode === 'blocked') {
    filteredUsers = users.filter(user => user.relationshipStatus === 'blocked');
  } else if (viewMode === 'online') {
    filteredUsers = users.filter((user) => onlineUsers.includes(user._id));
  }
  
  // Additional online filter (deprecated - keeping for backward compatibility)
  if (showOnlineOnly) {
    filteredUsers = filteredUsers.filter((user) => onlineUsers.includes(user._id));
  }

  const handleSelectUser = (user) => {
    // Prevent selecting blocked users
    if (user.relationshipStatus === 'blocked') {
      return;
    }
    
    setSelectedUser(user);

    // Immediately reset unread count in the store
    const currentState = useChatStore.getState();
    const updatedUsers = currentState.users.map((u) =>
      u._id === user._id ? { ...u, unreadCount: 0 } : u
    );
    useChatStore.setState({ users: updatedUsers });

    if (socket && authUser?._id && user._id) {
      socket.emit("markMessagesAsSeen", {
        senderId: user._id,
        receiverId: authUser._id,
      });
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="h-full w-full lg:w-72 lg:max-w-sm border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100"
    >
      <div className="border-b border-base-300 w-full p-3 lg:p-4">
        <div className="flex items-center gap-2 justify-center lg:justify-start">
          <Users className="size-6 flex-shrink-0" />
          <span className="font-semibold text-lg block">
            Contacts
          </span>
        </div>
        
        {/* View Mode Tabs */}
        <div className="mt-3 flex gap-1 flex-wrap">
          <button
            onClick={() => setViewMode('all')}
            className={`btn btn-xs ${viewMode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Users className="w-3 h-3" />
            All
          </button>
          <button
            onClick={() => setViewMode('friends')}
            className={`btn btn-xs ${viewMode === 'friends' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <UserCheck className="w-3 h-3" />
            Friends
          </button>
          <button
            onClick={() => setViewMode('online')}
            className={`btn btn-xs ${viewMode === 'online' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Online
          </button>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3 smooth-scroll">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => handleSelectUser(user)}
            disabled={user.relationshipStatus === 'blocked'}
            className={`
              w-full p-3 flex items-center gap-3
              transition-colors
              ${
                user.relationshipStatus === 'blocked' 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-base-300"
              }
              ${
                selectedUser?._id === user._id && user.relationshipStatus !== 'blocked'
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 animate-pulse rounded-full ring-2 ring-zinc-900" />
              )}
              {user.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {user.unreadCount > 99 ? "99+" : user.unreadCount}
                </div>
              )}
            </div>

            {/* User info - visible on all screens but responsive */}
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium truncate text-base">{user.fullName}</div>
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <span>{onlineUsers.includes(user._id) ? "Online" : "Offline"}</span>
                {user.relationshipStatus === 'friends' && (
                  <UserCheck className="w-3 h-3 text-success" />
                )}
                {user.relationshipStatus === 'blocked' && (
                  <Shield className="w-3 h-3 text-error" />
                )}
              </div>
            </div>
            
            {/* Friend Actions */}
            <FriendActions 
              user={user} 
              relationshipStatus={user.relationshipStatus || getRelationshipStatus(user._id)} 
            />
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
