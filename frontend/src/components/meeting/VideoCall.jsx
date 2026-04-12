 import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/socket";

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

  // ⏱️ Call duration timer
  useEffect(() => {
    if (!isCallStarted) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCallStarted]);

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
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      streamRef.current = stream;
      localVideo.current.srcObject = stream;
      setIsCallStarted(true);

      peerRef.current = createPeer(stream);

      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      socket.emit("offer", { roomId, offer });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Could not access camera/microphone. Check permissions.");
    }
  };

  const handleReceiveOffer = async (offer) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      streamRef.current = stream;
      localVideo.current.srcObject = stream;
      setIsCallStarted(true);

      peerRef.current = createPeer(stream);

      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerRef.current.createAnswer();
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
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-emerald-400">Video Call</h1>
        {isCallStarted && (
          <div className="text-sm md:text-base font-semibold text-emerald-400">
            ⏱️ {formatDuration(callDuration)}
          </div>
        )}
      </div>

      {/* Video Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4">
        {/* Remote Video (larger on desktop, full on mobile when available) */}
        <div className="flex-1 relative bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
          {isRemoteConnected ? (
            <video
              ref={remoteVideo}
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Waiting for remote user...</p>
                {!isCallStarted && (
                  <p className="text-xs text-gray-600">Click "Start Call" to begin</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local Video (smaller, bottom-right on desktop, below on mobile) */}
        <div className="md:w-1/3 h-48 md:h-auto relative bg-gray-950 rounded-lg overflow-hidden border-2 border-emerald-500">
          {isCallStarted ? (
            <video
              ref={localVideo}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500 text-sm">Your camera</p>
            </div>
          )}
          {isCallStarted && (
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
              {isVideoOn ? "📹 On" : "📹 Off"}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3 md:gap-4">
          {!isCallStarted ? (
            <button
              onClick={startCall}
              className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold transition flex items-center gap-2"
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
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
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
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
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
        <div className="bg-gray-800 p-3 md:p-4 text-center text-sm text-gray-300 border-t border-gray-700">
          {isRemoteConnected ? (
            <span className="text-emerald-400">✅ Connected</span>
          ) : (
            <span className="text-yellow-400">⏳ Connecting...</span>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoCall;