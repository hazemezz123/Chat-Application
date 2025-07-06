import { X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-3 lg:p-2.5 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          <button 
            onClick={() => setSelectedUser(null)}
            className="lg:hidden btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="size-5" />
          </button>
          
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium text-base lg:text-lg">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button for desktop */}
        <button 
          onClick={() => setSelectedUser(null)}
          className="hidden lg:block btn btn-ghost btn-sm btn-circle"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
