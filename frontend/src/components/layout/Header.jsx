import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  };

  if (!token) return null;

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-xl md:text-2xl font-bold text-emerald-400 cursor-pointer hover:text-emerald-300 transition"
        >
          💼 InterviewPrep
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={handleDashboard}
            className="text-white hover:text-emerald-400 transition"
          >
            Dashboard
          </button>

          {user.role === "interviewer" && (
            <button
              onClick={() => {
                navigate("/set-availability");
                setIsMenuOpen(false);
              }}
              className="text-white hover:text-emerald-400 transition"
            >
              📅 Availability
            </button>
          )}

          <div className="relative group">
            <button className="text-white hover:text-emerald-400 transition flex items-center gap-2">
              👤 {user.name || "User"}
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
              <button
                onClick={() => {
                  navigate("/user-profile");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition rounded-t-lg"
              >
                👤 View Profile
              </button>
              <button
                onClick={() => {
                  navigate("/complete-profile");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition rounded-b-lg"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white text-2xl"
        >
          ☰
        </button>
      </div>

        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-4 space-y-3">
            <button
              onClick={handleDashboard}
              className="w-full text-left px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              Dashboard
            </button>

            {user.role === "interviewer" && (
              <button
                onClick={() => {
                  navigate("/set-availability");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition"
              >
                📅 Set Availability
              </button>
            )}

            <button
              onClick={() => {
                navigate("/user-profile");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              👤 View Profile
            </button>

            <button
              onClick={() => {
                navigate("/complete-profile");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              ✏️ Edit Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-400 bg-red-900/20 rounded hover:bg-red-900/30 transition"
            >
              🚪 Logout
            </button>
          </div>
        )}
    </header>
  );
}
