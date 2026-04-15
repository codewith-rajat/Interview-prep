 import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import { Wifi, WifiOff, Send, X } from "lucide-react";

const VideoCall = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerRef = useRef();
  const streamRef = useRef();
  const screenStreamRef = useRef();

  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState("good");
  const [localParticipant, setLocalParticipant] = useState(null);
  const [remoteParticipant, setRemoteParticipant] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socketId, setSocketId] = useState(null);
  
  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingMessages, setPendingMessages] = useState([]); // Messages before socketId is set
  const chatEndRef = useRef();

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
            videoBitrate = (report.bytesReceived * 8) / 1000;
            packetLoss = report.packetsLost || 0;
          }
        });

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

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5001/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCurrentUserId(data._id);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // 🔑 Process pending messages once socketId is available
  useEffect(() => {
    if (socketId && pendingMessages.length > 0) {
      console.log(`🔑 Processing ${pendingMessages.length} pending messages with socketId: ${socketId}`);
      pendingMessages.forEach((msg) => {
        const isCurrentUserMessage = msg.socketId === socketId;
        console.log(`💬 Pending message - socketId: ${msg.socketId}, isCurrentUser: ${isCurrentUserMessage}`);
        setMessages((prev) => [...prev, { ...msg, isCurrentUser: isCurrentUserMessage }]);
      });
      setPendingMessages([]);
    }
  }, [socketId, pendingMessages]);

  useEffect(() => {
    // ⚡ CRITICAL: Set socketId IMMEDIATELY on connection
    const setSocketIdImmediately = () => {
      setSocketId(socket.id);
      console.log(`🔌 Socket ID set: ${socket.id}`);
    };

    // If already connected, set immediately
    if (socket.connected) {
      setSocketIdImmediately();
    }

    // Also listen for connect event
    socket.on("connect", setSocketIdImmediately);

    // Now emit join-room after socketId is set
    socket.emit("join-room", roomId);

    socket.on("offer", handleReceiveOffer);
    socket.on("answer", handleReceiveAnswer);
    socket.on("ice-candidate", handleNewICE);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("chat-message", handleChatMessage);
    socket.on("user-mute", (data) => {
      console.log(`🔇 Remote user ${data.socketId} muted: ${data.muted}`);
    });
    socket.on("user-video", (data) => {
      console.log(`📹 Remote user ${data.socketId} video: ${data.videoOn}`);
    });
    socket.on("screen-share-started", () => {
      console.log("📺 Remote user started screen sharing");
      setIsRemoteScreenSharing(true);
    });
    socket.on("screen-share-stopped", () => {
      console.log("📺 Remote user stopped screen sharing");
      setIsRemoteScreenSharing(false);
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
      socket.off("chat-message");
      socket.off("user-mute");
      socket.off("user-video");
      socket.off("screen-share-started");
      socket.off("screen-share-stopped");
      socket.off("connect", setSocketIdImmediately);
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
    console.log(`🎙️ [MUTE] Button clicked - Current state: isAudioOn=${isAudioOn}`);
    
    if (!streamRef.current) {
      console.error("❌ [MUTE] No stream available!");
      alert("No audio stream available. Start call first.");
      return;
    }
    
    const audioTracks = streamRef.current.getAudioTracks();
    console.log(`🎙️ [MUTE] Found ${audioTracks.length} audio tracks`);
    
    if (audioTracks.length === 0) {
      console.error("❌ [MUTE] No audio tracks found!");
      alert("No audio tracks found!");
      return;
    }
    
    // Toggle to the NEW state (opposite of current)
    const newAudioState = !isAudioOn;
    console.log(`🎙️ [MUTE] Toggling audio tracks to: ${newAudioState ? "ON" : "MUTED"}`);
    
    audioTracks.forEach((track, idx) => {
      track.enabled = newAudioState;
      console.log(`🎙️ [MUTE] Track ${idx} enabled: ${track.enabled}`);
    });
    
    // Update state FIRST
    setIsAudioOn(newAudioState);
    console.log(`🎙️ [MUTE] State set to: ${newAudioState}`);
    
    // Then notify others
    socket.emit("mute", { roomId, muted: !newAudioState });
    console.log(`🎙️ [MUTE] Sent mute notification - muted=${!newAudioState}`);
  };

  // 📹 Toggle video
  const toggleVideo = () => {
    console.log(`📹 [VIDEO] Button clicked - Current state: isVideoOn=${isVideoOn}`);
    
    if (!streamRef.current) {
      console.error("❌ [VIDEO] No stream available!");
      alert("No video stream available. Start call first.");
      return;
    }
    
    const videoTracks = streamRef.current.getVideoTracks();
    console.log(`📹 [VIDEO] Found ${videoTracks.length} video tracks`);
    
    if (videoTracks.length === 0) {
      console.error("❌ [VIDEO] No video tracks found!");
      alert("No video tracks found!");
      return;
    }
    
    // Toggle to the NEW state (opposite of current)
    const newVideoState = !isVideoOn;
    console.log(`📹 [VIDEO] Toggling video tracks to: ${newVideoState ? "ON" : "OFF"}`);
    
    videoTracks.forEach((track, idx) => {
      track.enabled = newVideoState;
      console.log(`📹 [VIDEO] Track ${idx} enabled: ${track.enabled}`);
    });
    
    // Update state FIRST
    setIsVideoOn(newVideoState);
    console.log(`📹 [VIDEO] State set to: ${newVideoState}`);
    
    // Then notify others
    socket.emit("video", { roomId, videoOn: newVideoState });
    console.log(`📹 [VIDEO] Sent video notification - videoOn=${newVideoState}`);
  };

  // 📞 End call
  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
    }
    socket.emit("leave-room", roomId);
    setIsCallStarted(false);
    setIsRemoteConnected(false);
    setCallDuration(0);
    setIsScreenSharing(false);
    navigate(-1);
  };

  // 📺 Share screen
  const toggleScreenShare = async () => {
    try {
      console.log(`📺 Toggle screen share - Current state: ${isScreenSharing}, Peer: ${peerRef.current ? "✅" : "❌"}`);
      
      if (!peerRef.current) {
        console.error("❌ Peer connection not established yet");
        alert("Please wait for video connection to establish before sharing screen");
        return;
      }

      if (!isScreenSharing) {
        // START SCREEN SHARE
        console.log("📺 [1/4] Getting display media...");
        
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { 
              cursor: "always",
              displaySurface: "monitor"
            },
            audio: false,
          });
          
          console.log("📺 [2/4] Display media obtained:", screenStream);
          screenStreamRef.current = screenStream;

          const videoTrack = screenStream.getVideoTracks()[0];
          console.log("📺 [3/4] Video track obtained:", videoTrack);
          
          if (!videoTrack) {
            throw new Error("Failed to get video track from screen stream");
          }

          const sender = peerRef.current
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");

          console.log("📺 [3.5/4] Found video sender:", sender ? "✅ YES" : "❌ NO");

          if (sender) {
            console.log("📺 [4/4] Replacing track with screen...");
            await sender.replaceTrack(videoTrack);
            setIsScreenSharing(true);
            console.log("✅ Screen sharing started!");

            socket.emit("screen-share-start", { roomId });

            // Handle when user stops sharing from the browser share menu
            videoTrack.onended = async () => {
              console.log("📺 Screen share stopped by user (from OS)");
              const originalTrack = streamRef.current.getVideoTracks()[0];
              if (originalTrack) {
                await sender.replaceTrack(originalTrack);
              }
              screenStreamRef.current = null;
              setIsScreenSharing(false);
              socket.emit("screen-share-stop", { roomId });
            };
          } else {
            console.error("❌ No video sender found for screen share");
            screenStream.getTracks().forEach(track => track.stop());
          }
        } catch (getMediaError) {
          console.error("❌ Failed to get display media:", getMediaError);
          if (getMediaError.name === "NotAllowedError") {
            alert("Screen sharing was cancelled");
          } else if (getMediaError.name === "NotFoundError") {
            alert("No screens/windows found to share");
          } else {
            alert(`Error accessing screen: ${getMediaError.message}`);
          }
          throw getMediaError;
        }
      } else {
        // STOP SCREEN SHARE
        console.log("📺 Stopping screen share...");
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => {
            console.log("📺 Stopping screen track:", track);
            track.stop();
          });
          screenStreamRef.current = null;
        }

        const videoTrack = streamRef.current?.getVideoTracks()[0];
        console.log("📺 Original video track:", videoTrack ? "✅ Found" : "❌ Not found");
        
        const sender = peerRef.current
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
          console.log("✅ Switched back to camera");
        } else {
          console.error("❌ Could not switch back to camera - sender or videoTrack missing");
        }

        setIsScreenSharing(false);
        socket.emit("screen-share-stop", { roomId });
      }
    } catch (error) {
      console.error("❌ Error in toggleScreenShare:", error);
      // Already handled the specific errors above
    }
  };

  // 💬 Send chat message
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    if (!socketId) {
      console.warn("⚠️ socketId not set yet, waiting...");
      return;
    }

    const message = {
      senderId: currentUserId,
      senderName: "You",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    console.log(`📤 Sending message from socketId ${socketId}: ${chatInput}`);
    // ✅ DON'T add to local messages - server will broadcast it back
    socket.emit("chat-message", { roomId, message });
    setChatInput("");
  };

  // 💬 Handle incoming chat messages
  const handleChatMessage = (message) => {
    console.log(`📨 RAW message received:`, message);
    console.log(`📍 Current socketId: ${socketId || "NOT_SET_YET"}`);
    console.log(`📍 Message socketId: ${message.socketId}`);
    
    // If socketId not available yet, store in pending (DON'T display yet)
    if (!socketId) {
      console.log(`⏳ socketId not available yet, storing message as pending - will process later`);
      setPendingMessages((prev) => [...prev, message]);
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
      return;
    }
    
    // Use socketId to identify sender - more reliable than userId
    const isCurrentUserMessage = message.socketId === socketId;
    console.log(`📍 Is current user message? ${isCurrentUserMessage}`);
    
    const displayMessage = {
      ...message,
      isCurrentUser: isCurrentUserMessage,
    };
    
    console.log(`💬 Message will display as: ${isCurrentUserMessage ? "RIGHT ✓ (sender)" : "LEFT (receiver)"}`);
    
    setMessages((prev) => [...prev, displayMessage]);
    if (!isChatOpen) {
      setUnreadCount((prev) => prev + 1);
    }
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
      <div className="bg-[#0f0f11] border-b border-amber-500/20 p-3 md:p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3">
          <h1 className="text-lg md:text-2xl font-bold text-amber-400">🎥 Interview Call</h1>
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
          <div className="text-xs md:text-base font-semibold text-amber-400">
            ⏱️ {formatDuration(callDuration)}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4">
        {/* Video Area */}
        <div className="flex-1 flex flex-col gap-2 md:gap-4">
          {/* Remote Video (larger) */}
          <div className="flex-1 relative bg-[#0f0f11] rounded-lg overflow-hidden border-2 border-amber-500/30 min-h-[200px] md:min-h-0">
            <video
              ref={remoteVideo}
              autoPlay
              className="w-full h-full object-cover"
              style={{ display: isRemoteConnected ? 'block' : 'none' }}
            />
            {!isRemoteConnected && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-stone-500 mb-2">⏳ Waiting for remote user...</p>
                  {!isCallStarted && (
                    <p className="text-xs text-stone-600">Click "Start Call" to begin</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Remote participant info overlay */}
            {isRemoteConnected && (
              <div className="absolute top-2 left-2 bg-black/70 px-3 py-1 rounded-full text-xs font-semibold">
                👤 Remote User {isRemoteScreenSharing && "📺 (Screen)"}
              </div>
            )}
          </div>

          {/* Local Video (smaller, picture-in-picture) */}
          <div className={`md:absolute md:bottom-20 md:right-4 md:w-48 md:h-36 h-32 w-full relative bg-[#0f0f11] rounded-lg overflow-hidden border-2 border-amber-500 ${isScreenSharing ? "md:w-32 md:h-24" : ""}`}>
            <video
              ref={localVideo}
              autoPlay
              muted
              className="w-full h-full object-cover"
              style={{ display: isCallStarted && !isScreenSharing ? 'block' : isScreenSharing ? 'block' : 'none', opacity: isScreenSharing ? 0.6 : 1 }}
            />
            {!isCallStarted && (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-stone-500 text-sm">📷 Your camera</p>
              </div>
            )}
            {isCallStarted && (
              <div className="absolute top-1 left-1 right-1 flex justify-between items-center">
                <span className="text-xs bg-black/70 px-2 py-0.5 rounded font-semibold">You</span>
                <div className="flex gap-1">
                  <span className={`text-xs font-bold px-1 py-0.5 rounded ${isVideoOn ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"}`}>
                    {isVideoOn ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className={`${isChatOpen ? "w-full md:w-72" : "hidden md:flex md:w-72"} flex flex-col bg-[#0f0f11] rounded-lg border-2 border-amber-500/30 overflow-hidden transition-all duration-300`}>
          {/* Chat Header */}
          <div className="bg-amber-500/10 border-b border-amber-500/30 p-3 flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              💬 Chat
              {unreadCount > 0 && !isChatOpen && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                if (!isChatOpen) setUnreadCount(0);
              }}
              className="md:hidden text-amber-400 hover:text-amber-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-96 md:max-h-[calc(100vh-400px)]">
            {messages.length === 0 ? (
              <div className="text-center text-stone-500 text-sm py-8">
                💭 No messages yet
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col gap-1">
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.isCurrentUser
                          ? "bg-amber-500/80 text-white rounded-br-none"
                          : "bg-stone-700 text-stone-100 rounded-bl-none"
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      <span className="text-xs opacity-70">
                        {msg.timestamp}
                      </span>
                    </div>
                    {msg.isCurrentUser && (
                      <span className="text-xs text-stone-400 text-right px-1">You</span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          {isCallStarted && (
            <div className="border-t border-amber-500/30 p-2 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-stone-800 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={sendChatMessage}
                className="bg-amber-500 hover:bg-amber-600 text-black p-2 rounded transition"
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#0f0f11] border-t border-amber-500/20 p-3 md:p-4">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2 md:gap-3">
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
                title={isAudioOn ? "Mute" : "Unmute"}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition flex items-center gap-2 text-sm md:text-base ${
                  isAudioOn
                    ? "bg-stone-700 hover:bg-stone-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isAudioOn ? "🎙️ Mute" : "🔇 Unmute"}
              </button>

              {/* Toggle Video */}
              <button
                onClick={toggleVideo}
                title={isVideoOn ? "Turn off camera" : "Turn on camera"}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition flex items-center gap-2 text-sm md:text-base ${
                  isVideoOn
                    ? "bg-stone-700 hover:bg-stone-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isVideoOn ? "📹 Camera On" : "📹 Camera Off"}
              </button>

              {/* Screen Share */}
              <button
                onClick={toggleScreenShare}
                title={isScreenSharing ? "Stop sharing" : "Share screen"}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition flex items-center gap-2 text-sm md:text-base ${
                  isScreenSharing
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-stone-700 hover:bg-stone-600 text-white"
                }`}
              >
                📺 {isScreenSharing ? "Stop Share" : "Share Screen"}
              </button>

              {/* Chat Toggle (Mobile) */}
              <button
                onClick={() => {
                  setIsChatOpen(!isChatOpen);
                  setUnreadCount(0);
                }}
                className="md:hidden px-4 py-2 md:py-3 rounded-lg font-semibold bg-stone-700 hover:bg-stone-600 text-white flex items-center gap-2 text-sm relative"
              >
                💬 Chat
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* End Call */}
              <button
                onClick={handleEndCall}
                className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg font-semibold transition flex items-center gap-2 text-sm md:text-base"
              >
                ✕ End Call
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {isCallStarted && (
        <div className="bg-stone-900/50 p-2 md:p-3 text-center text-xs md:text-sm border-t border-amber-500/20">
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
            {isScreenSharing && (
              <span className="ml-2 text-blue-400 font-semibold">📺 Sharing Screen</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;