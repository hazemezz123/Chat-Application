import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./Skeleton/SideBarSkeleton";
import { Users, Search } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center gap-3">
          <Users className="size-6 flex-shrink-0" />
          <span className="text-xl font-semibold hidden lg:block">
            Contacts
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-base-300">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full !h-10 pl-10 hidden lg:block"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto w-full py-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-4
                hover:bg-base-200 transition-all duration-200
                ${
                  selectedUser?._id === user._id
                    ? "bg-primary/5 border-l-4 border-primary"
                    : "border-l-4 border-transparent"
                }
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={`${user.fullName}'s avatar`}
                    />
                  </div>
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-base-100" />
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-semibold truncate">{user.fullName}</div>
                <div
                  className={`text-sm ${
                    onlineUsers.includes(user._id)
                      ? "text-green-400"
                      : "text-base-content/60"
                  }`}
                >
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-base-content/60 py-10 px-4 flex flex-col items-center justify-center">
            <Users className="size-10 mb-4" />
            <p className="font-medium">No users found</p>
            <p className="text-sm">
              {searchTerm
                ? "Try a different search term."
                : "There are no other users to chat with."}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
