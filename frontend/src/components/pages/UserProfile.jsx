import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useToast } from "../ui/Toast";
import { Spinner } from "../ui/Loaders";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await API.get("/user/me");
        setUser(res.data);
      } catch (error) {
        showToast("Failed to load profile", "error");
        navigate("/dashboard/1");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-400 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load profile</p>
          <button
            onClick={() => navigate("/dashboard/1")}
            className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-2 rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-4 md:p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-400">👤 My Profile</h1>
          <button
            onClick={() => navigate(-1)}
            className="border border-emerald-500 text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition"
          >
            ← Back
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">

          {/* BASIC INFO */}
          <div className="mb-8 pb-8 border-b border-gray-800">
            <h2 className="text-xl font-bold text-emerald-400 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Full Name</p>
                <p className="text-white font-semibold text-lg">{user.name}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-semibold">{user.email}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <p className="text-white font-semibold capitalize">
                  {user.role === "interviewee" ? "👤 Interviewee" : "💼 Interviewer"}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Bio</p>
                <p className="text-white">{user.bio || "No bio added yet"}</p>
              </div>
            </div>
          </div>

          {/* SKILLS */}
          {user.skills && user.skills.length > 0 && (
            <div className="mb-8 pb-8 border-b border-gray-800">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, i) => (
                  <span key={i} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* STUDENT INFO */}
          {user.role === "interviewee" && user.isStudent && (
            <div className="mb-8 pb-8 border-b border-gray-800">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">🎓 Student Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">University</p>
                  <p className="text-white font-semibold">{user.university || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Branch</p>
                  <p className="text-white font-semibold">{user.branch || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Graduation Year</p>
                  <p className="text-white font-semibold">{user.graduationYear || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONAL INFO */}
          {(user.isStudent === false || user.role === "interviewer") && (
            <div className="mb-8 pb-8 border-b border-gray-800">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">💼 Professional Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Company</p>
                  <p className="text-white font-semibold">{user.workingAt || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Years of Experience</p>
                  <p className="text-white font-semibold">{user.yearsOfExperience || "N/A"} years</p>
                </div>
              </div>
            </div>
          )}

          {/* INTERVIEWER STATS */}
          {user.role === "interviewer" && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">📊 Interviewer Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Sessions</p>
                  <p className="text-emerald-400 font-bold text-2xl">{user.totalSessions || 0}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Average Rating</p>
                  <p className="text-yellow-400 font-bold text-2xl">{'⭐'.repeat(Math.round(user.rating || 0))}</p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => navigate("/complete-profile")}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-lg font-semibold transition"
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
