import React, { useState } from "react";
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Check, 
  X, 
  Shield, 
  ShieldOff,
  MoreVertical,
  UserMinus
} from "lucide-react";
import { useFriendsStore } from "../store/useFriendsStore";
import { motion, AnimatePresence } from "framer-motion";

const FriendActions = ({ user, relationshipStatus }) => {
  const [showActions, setShowActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    blockUser,
    unblockUser,
    removeFriend,
  } = useFriendsStore();

  const handleAction = async (action, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setIsLoading(true);
    let success = false;

    switch (action) {
      case "sendRequest":
        success = await sendFriendRequest(user._id);
        break;
      case "acceptRequest":
        success = await acceptFriendRequest(user._id);
        break;
      case "rejectRequest":
        success = await rejectFriendRequest(user._id);
        break;
      case "block":
        success = await blockUser(user._id);
        break;
      case "unblock":
        success = await unblockUser(user._id);
        break;
      case "removeFriend":
        success = await removeFriend(user._id);
        break;
    }

    if (success) {
      setShowActions(false);
    }
    setIsLoading(false);
  };

  const renderActionButton = () => {
    switch (relationshipStatus) {
      case "friends":
        return (
          <div className="relative">
            <button
              onClick={handleButtonClick}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={isLoading}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-8 bg-base-100 shadow-lg rounded-lg border border-base-300 z-10 min-w-[120px]"
                >
                  <button
                    onClick={(e) => handleAction("removeFriend", e)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 flex items-center gap-2 text-warning"
                    disabled={isLoading}
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove Friend
                  </button>
                  <button
                    onClick={(e) => handleAction("block", e)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 flex items-center gap-2 text-error"
                    disabled={isLoading}
                  >
                    <Shield className="w-4 h-4" />
                    Block User
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "requestReceived":
        return (
          <div className="flex gap-1">
            <button
              onClick={(e) => handleAction("acceptRequest", e)}
              className="btn btn-success btn-sm btn-circle"
              disabled={isLoading}
              title="Accept friend request"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleAction("rejectRequest", e)}
              className="btn btn-error btn-sm btn-circle"
              disabled={isLoading}
              title="Reject friend request"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );

      case "requestSent":
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-info">Request Sent</span>
            <UserCheck className="w-4 h-4 text-info" />
          </div>
        );

      case "blocked":
        return (
          <button
            onClick={(e) => handleAction("unblock", e)}
            className="btn btn-ghost btn-sm"
            disabled={isLoading}
          >
            <ShieldOff className="w-4 h-4" />
            <span className="hidden lg:inline ml-1">Unblock</span>
          </button>
        );

      default: // "none"
        return (
          <div className="relative">
            <button
              onClick={handleButtonClick}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={isLoading}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-8 bg-base-100 shadow-lg rounded-lg border border-base-300 z-10 min-w-[140px]"
                >
                  <button
                    onClick={(e) => handleAction("sendRequest", e)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 flex items-center gap-2 text-primary"
                    disabled={isLoading}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </button>
                  <button
                    onClick={(e) => handleAction("block", e)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 flex items-center gap-2 text-error"
                    disabled={isLoading}
                  >
                    <Shield className="w-4 h-4" />
                    Block User
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
    }
  };

  // Click outside to close actions menu
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the button or dropdown
      if (event.target.closest('.friend-actions-container')) {
        return;
      }
      setShowActions(false);
    };

    if (showActions) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showActions]);

  const handleButtonClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowActions(!showActions);
  };

  return (
    <div className="flex items-center friend-actions-container" onClick={(e) => e.stopPropagation()}>
      {isLoading && (
        <div className="loading loading-spinner loading-sm mr-2"></div>
      )}
      {renderActionButton()}
    </div>
  );
};

export default FriendActions;
