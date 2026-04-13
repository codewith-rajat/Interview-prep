import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDashboard = () => {
    if (user.role === "interviewee") {
      navigate("/dashboard/1");
    } else if (user.role === "interviewer") {
      navigate("/dashboard/2");
    }
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  if (!token) return null;

  return (
    <header className="bg-black border-b border-amber-900/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={() => {
              navigate("/");
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              ✓ InterviewPrep
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={handleDashboard}
              className="text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium"
            >
              Dashboard
            </button>

            {user.role === "interviewer" && (
              <button
                onClick={() => {
                  navigate("/set-availability");
                  setIsMenuOpen(false);
                }}
                className="text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium"
              >
                Set Availability
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-amber-900/10 hover:text-amber-400 transition-colors text-sm font-medium"
              >
                <span className="w-8 h-8 bg-amber-900/30 rounded-full flex items-center justify-center text-amber-400 text-xs font-semibold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
                {user.name || "User"}
                <ChevronDown size={16} className={`transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-gradient-to-b from-gray-900 to-black border border-amber-900/20 rounded-lg shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-amber-900/10">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Logged in as</p>
                    <p className="text-sm font-semibold text-amber-400">{user.name}</p>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/user-profile");
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-300 hover:bg-amber-900/20 hover:text-amber-400 transition-colors text-sm"
                  >
                    👤 View Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate("/complete-profile");
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-300 hover:bg-amber-900/20 hover:text-amber-400 transition-colors text-sm border-b border-amber-900/10"
                  >
                    ✏️ Edit Profile
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-amber-400 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-amber-900/20 space-y-2">
            <button
              onClick={handleDashboard}
              className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-amber-900/20 hover:text-amber-400 rounded-lg transition-colors text-sm font-medium"
            >
              Dashboard
            </button>

            {user.role === "interviewer" && (
              <button
                onClick={() => {
                  navigate("/set-availability");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-amber-900/20 hover:text-amber-400 rounded-lg transition-colors text-sm font-medium"
              >
                📅 Set Availability
              </button>
            )}

            <div className="border-t border-amber-900/20 my-2 pt-2">
              <button
                onClick={() => {
                  navigate("/user-profile");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-amber-900/20 hover:text-amber-400 rounded-lg transition-colors text-sm"
              >
                👤 View Profile
              </button>

              <button
                onClick={() => {
                  navigate("/complete-profile");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-amber-900/20 hover:text-amber-400 rounded-lg transition-colors text-sm"
              >
                ✏️ Edit Profile
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors text-sm"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
