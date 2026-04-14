 import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import { Wifi, WifiOff } from "lucide-react";

const VideoCall = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerRef = useRef();
  const streamRef = useRef();

  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState("good"); // good, fair, poor
  const [localParticipant, setLocalParticipant] = useState(null);
  const [remoteParticipant, setRemoteParticipant] = useState(null);

  // ⏱️ Call duration timer
  useEffect(() => {
    if (!isCallStarted) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCallStarted]);

  // 📊 Connection quality monitoring
  useEffect(() => {
    if (!isRemoteConnected || !peerRef.current) return;

    const monitorConnection = async () => {
      try {
        const stats = await peerRef.current.getStats();
        let videoBitrate = 0;
        let packetLoss = 0;

        stats.forEach((report) => {
          if (report.type === "inbound-rtp" && report.kind === "video") {
            videoBitrate = (report.bytesReceived * 8) / 1000; // kbps
            packetLoss = report.packetsLost || 0;
          }
        });

        // Determine quality
        if (videoBitrate > 2000 && packetLoss < 5) {
          setConnectionQuality("good");
        } else if (videoBitrate > 1000) {
          setConnectionQuality("fair");
        } else {
          setConnectionQuality("poor");
        }
      } catch (error) {
        console.error("Error monitoring connection:", error);
      }
    };

    const interval = setInterval(monitorConnection, 3000);
    return () => clearInterval(interval);
  }, [isRemoteConnected]);

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("offer", handleReceiveOffer);
    socket.on("answer", handleReceiveAnswer);
    socket.on("ice-candidate", handleNewICE);
    socket.on("user-disconnected", handleUserDisconnected);

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
    };
  }, []);

  const createPeer = (stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    peer.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
      setIsRemoteConnected(true);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
        handleEndCall();
      }
    };

    return peer;
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      localVideo.current.srcObject = stream;
      setIsCallStarted(true);

      peerRef.current = createPeer(stream);

      const offer = await peerRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerRef.current.setLocalDescription(offer);

      socket.emit("offer", { roomId, offer });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Could not access camera/microphone. Please check permissions in your browser settings.");
    }
  };

  const handleReceiveOffer = async (offer) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      localVideo.current.srcObject = stream;
      setIsCallStarted(true);

      peerRef.current = createPeer(stream);

      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerRef.current.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleReceiveAnswer = async (answer) => {
    try {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        setIsRemoteConnected(true);
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleNewICE = async (candidate) => {
    try {
      if (peerRef.current && candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  const handleUserDisconnected = () => {
    handleEndCall();
  };

  // 🎙️ Toggle audio
  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  // 📹 Toggle video
  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  // 📞 End call
  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
    }
    socket.emit("leave-room", roomId);
    setIsCallStarted(false);
    setIsRemoteConnected(false);
    setCallDuration(0);
    navigate(-1);
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#0f0f11] border-b border-amber-500/20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-amber-400">🎥 Interview Call</h1>
          <div className={`w-3 h-3 rounded-full ${
            isRemoteConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500 animate-pulse"
          }`}></div>
          {isRemoteConnected && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              connectionQuality === "good"
                ? "bg-green-500/20 text-green-400"
                : connectionQuality === "fair"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {connectionQuality === "good" ? "✓ Good" : connectionQuality === "fair" ? "⚠ Fair" : "✕ Poor"}
            </span>
          )}
        </div>
        {isCallStarted && (
          <div className="text-sm md:text-base font-semibold text-amber-400">
            ⏱️ {formatDuration(callDuration)}
          </div>
        )}
      </div>

      {/* Video Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4">
        {/* Remote Video (larger on desktop, full on mobile when available) */}
        <div className="flex-1 relative bg-[#0f0f11] rounded-lg overflow-hidden border-2 border-amber-500/30">
          {isRemoteConnected ? (
            <video
              ref={remoteVideo}
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-stone-500 mb-2">⏳ Waiting for remote user...</p>
                {!isCallStarted && (
                  <p className="text-xs text-stone-600">Click "Start Call" to begin</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local Video (smaller, bottom-right on desktop, below on mobile) */}
        <div className="md:w-1/3 h-48 md:h-auto relative bg-[#0f0f11] rounded-lg overflow-hidden border-2 border-amber-500">
          {isCallStarted ? (
            <video
              ref={localVideo}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-stone-500 text-sm">📷 Your camera</p>
            </div>
          )}
          {isCallStarted && (
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              <div className="bg-black/60 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                <span className={isVideoOn ? "text-green-400" : "text-red-400"}>
                  {isVideoOn ? "📹" : "📹"}
                </span>
                <span className="text-stone-300">{isVideoOn ? "On" : "Off"}</span>
              </div>
              <div className="bg-black/60 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                <span className={isAudioOn ? "text-green-400" : "text-red-400"}>
                  {isAudioOn ? "🎙️" : "🔇"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#0f0f11] border-t border-amber-500/20 p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3 md:gap-4">
          {!isCallStarted ? (
            <button
              onClick={startCall}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold transition flex items-center gap-2 transform hover:scale-105"
            >
              📞 Start Call
            </button>
          ) : (
            <>
              {/* Mute/Unmute */}
              <button
                onClick={toggleAudio}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                  isAudioOn
                    ? "bg-stone-700 hover:bg-stone-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isAudioOn ? "🎙️ Mute" : "🔇 Unmuted"}
              </button>

              {/* Toggle Video */}
              <button
                onClick={toggleVideo}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                  isVideoOn
                    ? "bg-stone-700 hover:bg-stone-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isVideoOn ? "📹 Camera On" : "📹 Camera Off"}
              </button>

              {/* End Call */}
              <button
                onClick={handleEndCall}
                className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg font-semibold transition flex items-center gap-2"
              >
                📞 End Call
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {isCallStarted && (
        <div className="bg-stone-900/50 p-3 md:p-4 text-center text-sm border-t border-amber-500/20 space-y-2">
          <div className="flex items-center justify-center gap-2">
            {isRemoteConnected ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 font-semibold">Connected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="text-amber-400 font-semibold">Connecting...</span>
              </>
            )}
          </div>
          {isRemoteConnected && (
            <div className="text-xs text-stone-500">
              Both participants are connected • Network {connectionQuality}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoCall;