import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Phone, Clock, AlertCircle, Loader } from "lucide-react";
import API from "../utils/api";
import { useToast } from "../ui/Toast";

const JoinWaitingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [timeUntilStart, setTimeUntilStart] = useState(null);
  const [canJoin, setCanJoin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        // Get current user
        const userRes = await API.get("/users/me");
        setCurrentUser(userRes.data.data);

        // Find interview by roomId
        const res = await API.get("/interviews/upcoming");
        const foundInterview = res.data.data.find(i => i.roomId === roomId);

        if (!foundInterview) {
          showToast("Interview not found", "error");
          navigate(-1);
          return;
        }

        setInterview(foundInterview);

        // Determine other user
        const userId = userRes.data.data._id;
        const otherUserId = foundInterview.interviewer._id === userId 
          ? foundInterview.interviewee 
          : foundInterview.interviewer;

        setOtherUser(otherUserId);
      } catch (error) {
        console.error("Error fetching interview:", error);
        showToast("Failed to load interview details", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewData();
  }, [roomId, navigate, showToast]);

  // Update time until start and join eligibility
  useEffect(() => {
    if (!interview) return;

    const updateTimer = () => {
      const now = new Date();
      const startTime = new Date(interview.scheduledAt);
      const diff = startTime - now;

      // Can join if 5 mins before to 1 hour after
      const canJoinNow = diff <= 5 * 60 * 1000 && diff >= -60 * 60 * 1000;
      setCanJoin(canJoinNow);

      if (diff > 0) {
        // Interview hasn't started
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeUntilStart(`${mins}m ${secs}s`);
      } else if (diff >= -60 * 60 * 1000) {
        // Interview is ongoing
        const minsElapsed = Math.floor(Math.abs(diff) / 60000);
        setTimeUntilStart(`Live now (${minsElapsed}m elapsed)`);
      } else {
        // Too late to join
        setTimeUntilStart("Session ended");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [interview]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-stone-300">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-stone-300">Interview not found</p>
        </div>
      </div>
    );
  }

  const isInterviewer = currentUser && interview.interviewer._id === currentUser._id;
  const otherUserName = isInterviewer ? interview.interviewee?.name : interview.interviewer?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f0f11] to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-[#0f0f11] border-2 border-amber-500/30 rounded-2xl p-8 text-center space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-amber-400 mb-2">
              🎥 Ready to Join?
            </h1>
            <p className="text-stone-400">Interview with {otherUserName}</p>
          </div>

          {/* Interview Details */}
          <div className="bg-black/40 rounded-xl p-4 space-y-3 text-left border border-amber-500/20">
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Scheduled Time:</span>
              <span className="text-stone-200 font-semibold">
                {new Date(interview.scheduledAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Duration:</span>
              <span className="text-stone-200 font-semibold">{interview.duration} minutes</span>
            </div>
            <div className="h-px bg-amber-500/20"></div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-2">
                <Clock size={16} />
                Starts in:
              </span>
              <span className={`font-bold text-lg ${
                canJoin ? "text-green-400" : "text-amber-400"
              }`}>
                {timeUntilStart}
              </span>
            </div>
          </div>

          {/* Status Message */}
          {!canJoin && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-400 text-sm">
                ⏰ You can join up to <strong>5 minutes</strong> before the scheduled time.
              </p>
            </div>
          )}

          {canJoin && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-400 text-sm">
                ✅ Interview is ready! You can join now.
              </p>
            </div>
          )}

          {/* Join Button */}
          <button
            onClick={() => navigate(`/video-call/${roomId}`)}
            disabled={!canJoin}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              canJoin
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black transform hover:scale-105 shadow-lg"
                : "bg-white/5 text-stone-500 cursor-not-allowed border border-white/10"
            }`}
          >
            <Phone size={24} />
            {canJoin ? "Join Video Call" : "Waiting..."}
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 space-y-3 text-center text-sm text-stone-500">
          <p>💡 Tips:</p>
          <ul className="space-y-2">
            <li>✓ Allow camera & microphone permissions</li>
            <li>✓ Test your connection before joining</li>
            <li>✓ Find a quiet place for better audio</li>
            <li>✓ Good lighting helps with video quality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinWaitingRoom;
