import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  LogOut,
  MessageCircle,
  MessageSquare,
  Settings,
  User,
  Menu,
  X,
  Bell,
  Info,
} from "lucide-react";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const { users, unreadMessages, clearNotificationsForUser, setSelectedUser } =
    useChatStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const mobileNotificationRef = useRef(null);

  // Calculate total unread count
  const totalUnreadCount = users.reduce(
    (acc, user) => acc + (user.unreadCount || 0),
    0
  );

  // Handle click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        mobileNotificationRef.current &&
        !mobileNotificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen]);

  const handleNotificationClick = (notification) => {
    // Navigate to chat with the sender
    const sender = users.find((u) => u._id === notification.senderId);
    if (sender) {
      setSelectedUser(sender);
      clearNotificationsForUser(notification.senderId);
    }
    setNotificationOpen(false);
  };

  const menuItems = (
    <>
      <Link
        to="/about"
        className="btn btn-sm gap-2 w-full sm:w-auto"
        onClick={() => setMenuOpen(false)}
      >
        <Info className="w-4 h-4" />
        <span>About</span>
      </Link>
      <Link
        to="/settings"
        className="btn btn-sm gap-2 w-full sm:w-auto"
        onClick={() => setMenuOpen(false)}
      >
        <Settings className="w-4 h-4" />
        <span>Settings</span>
      </Link>
      {authUser && (
        <>
          <Link
            to="/profile"
            className="btn btn-sm gap-2 w-full sm:w-auto"
            onClick={() => setMenuOpen(false)}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          <Link
            to="/"
            className="btn btn-sm gap-2 w-full sm:w-auto relative"
            onClick={() => setMenuOpen(false)}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat</span>
          </Link>
          {/* Notification Dropdown - Hidden in mobile menu since it's moved to navbar */}
          <div className="relative hidden sm:block" ref={notificationRef}>
            <motion.button
              className="btn btn-sm gap-2 w-full sm:w-auto relative"
              onClick={() => setNotificationOpen(!notificationOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />
              <span className="hidden sm:inline">Notifications</span>
              {totalUnreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute  -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                >
                  {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                </motion.div>
              )}
            </motion.button>

            <AnimatePresence>
              {notificationOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute overflow-x-hidden right-0 mt-2 w-80 max-w-[90vw] bg-base-100 shadow-xl rounded-lg border border-base-300 z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-3 border-b border-base-300">
                    <h3 className="font-semibold text-base-content">
                      Notifications
                    </h3>
                  </div>
                  {unreadMessages.length > 0 ? (
                    <div className="py-2">
                      {unreadMessages.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 hover:bg-base-200 cursor-pointer transition-colors"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={notification.senderAvatar}
                              alt="avatar"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-base-content">
                                {notification.senderName}
                              </p>
                              <p className="text-sm text-base-content/70 truncate">
                                {notification.text}
                              </p>
                              <p className="text-xs text-base-content/50 mt-1">
                                {formatDistanceToNow(
                                  new Date(notification.timestamp),
                                  { addSuffix: true }
                                )}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Bell className="w-12 h-12 mx-auto text-base-content/30 mb-2" />
                      <p className="text-base-content/60">
                        No new notifications
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="btn btn-sm btn-ghost gap-2 text-error w-full sm:w-auto"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </>
      )}
    </>
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-40 bg-base-100/80 backdrop-blur border-b border-base-300"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <motion.div
              whileHover={{ rotate: 5 }}
              className="size-9 bg-primary/10 rounded-lg flex items-center justify-center"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-lg font-bold text-base-content">Chatty</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2">{menuItems}</nav>

          {/* Mobile actions */}
          <div className="sm:hidden flex items-center gap-2">
            {/* Mobile notification button */}
            {authUser && (
              <div className="relative" ref={mobileNotificationRef}>
                <motion.button
                  className="btn btn-circle btn-ghost btn-sm relative"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-5 h-5" />
                  {totalUnreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-4 flex items-center justify-center px-1"
                    >
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </motion.div>
                  )}
                </motion.button>
                
                {/* Mobile Notification Dropdown */}
                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute overflow-x-hidden right-0 mt-2 w-80 max-w-[90vw] bg-base-100 shadow-xl rounded-lg border border-base-300 z-50 max-h-96 overflow-y-auto notification-dropdown"
                    >
                      <div className="p-3 border-b border-base-300">
                        <h3 className="font-semibold text-base-content">
                          Notifications
                        </h3>
                      </div>
                      {unreadMessages.length > 0 ? (
                        <div className="py-2">
                          {unreadMessages.map((notification, index) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-3 hover:bg-base-200 cursor-pointer transition-colors"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={notification.senderAvatar}
                                  alt="avatar"
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-base-content truncate">
                                    {notification.senderName}
                                  </p>
                                  <p className="text-sm text-base-content/70 break-words line-clamp-2">
                                    {notification.text}
                                  </p>
                                  <p className="text-xs text-base-content/50 mt-1">
                                    {formatDistanceToNow(
                                      new Date(notification.timestamp),
                                      { addSuffix: true }
                                    )}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <Bell className="w-12 h-12 mx-auto text-base-content/30 mb-2" />
                          <p className="text-base-content/60">
                            No new notifications
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* Mobile menu button */}
            <motion.button
              className="btn btn-circle btn-ghost"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              whileTap={{ scale: 0.9 }}
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-base-100 border-b border-base-300 shadow-lg"
          >
            <div className="flex flex-col gap-2 p-4">{menuItems}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
