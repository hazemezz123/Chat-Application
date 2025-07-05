import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import {
  LogOut,
  MessageCircle,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-base-100/80 backdrop-blur border-b border-base-300">
      <div className="container mx-auto px-4 h-16">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-base-content">Chatty</span>
          </Link>

          {/* Actions */}
          <nav className="flex items-center gap-2">
            <Link to="/about" className="btn btn-sm gap-2">
              <span className="hidden sm:inline">About</span>
            </Link>
            <Link to="/settings" className="btn btn-sm gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to="/profile" className="btn btn-sm gap-2">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <Link to="/" className="btn btn-sm gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Chat</span>
                </Link>

                <button
                  onClick={logout}
                  className="btn btn-sm btn-ghost gap-2 text-error"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
