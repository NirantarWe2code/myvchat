import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams } from "react-router-dom";

// Custom hook for WebSocket connection
function useWebSocket(url, options = {}) {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [error, setError] = useState(null);
  const websocketRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket Connected");
        setConnectionStatus("Connected");
        if (options.onOpen) options.onOpen(ws);
      };

      ws.onmessage = (event) => {
        console.log("WebSocket Message:", event.data);
        if (options.onMessage) options.onMessage(event);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setError(error);
        setConnectionStatus("Error");
        if (options.onError) options.onError(error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket Disconnected:", event);
        setConnectionStatus("Disconnected");
        if (options.onClose) options.onClose(event);

        // Attempt reconnection
        setTimeout(connect, 3000);
      };

      return ws;
    } catch (err) {
      console.error("WebSocket Connection Error:", err);
      setError(err);
      setConnectionStatus("Error");
      return null;
    }
  }, [
    url,
    options.onOpen,
    options.onMessage,
    options.onError,
    options.onClose,
  ]);

  const sendMessage = useCallback((message) => {
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      try {
        websocketRef.current.send(JSON.stringify(message));
        console.log("Message sent:", message);
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err);
      }
    } else {
      console.warn("WebSocket not open. Message not sent.");
    }
  }, []);

  return {
    websocket: websocketRef.current,
    connectionStatus,
    error,
    connect,
    sendMessage,
  };
}

function VideoCallRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState([]);

  // Memoize environment variables
  const WS_BASE_URL = useMemo(
    () => process.env.REACT_APP_WS_BASE_URL || "ws://localhost:8001",
    []
  );
  const ENABLE_CHAT = useMemo(
    () => process.env.REACT_APP_ENABLE_CHAT === "true",
    []
  );

  // Generate unique user ID
  const userIdRef = useRef(`user-${Math.random().toString(36).substr(2, 9)}`);

  // WebSocket connection
  const {
    websocket,
    connectionStatus,
    error: wsError,
    sendMessage: sendWsMessage,
  } = useWebSocket(`${WS_BASE_URL}/ws/${roomId}`, {
    onOpen: (ws) => {
      // Send join room message
      sendWsMessage({
        type: "join_room",
        roomId: roomId,
        userId: userIdRef.current,
      });
    },
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        switch (message.type) {
          case "chat":
            if (ENABLE_CHAT) {
              setMessages((prev) => {
                const isDuplicate = prev.some(
                  (m) =>
                    m.text === message.text &&
                    m.sender === message.sender &&
                    m.timestamp === message.timestamp
                );
                return isDuplicate ? prev : [...prev, message];
              });
            }
            break;

          case "room_participants":
            setParticipants(message.participants);
            break;

          case "answer":
            handleAnswer(message.answer);
            break;

          case "ice-candidate":
            handleIceCandidate(message.candidate);
            break;

          default:
            console.log("Unhandled message type:", message.type);
        }
      } catch (err) {
        console.error("Error processing message:", err);
      }
    },
  });

  // Local video and WebRTC references
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Memoize createPeerConnection to prevent unnecessary recreations
  const createPeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        // Google STUN servers
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },

        // Twilio STUN servers
        { urls: "stun:global.stun.twilio.com:3478" },

        // Mozilla STUN servers
        { urls: "stun:stun.services.mozilla.com" },

        // Xirsys STUN servers (free tier)
        { urls: "stun:stun.xirsys.com" },

        // Additional reliable STUN servers
        { urls: "stun:stun.sipnet.net:3478" },
        { urls: "stun:stun.sipnet.ru:3478" },
        { urls: "stun:stun.stunprotocol.org:3478" },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage({
          type: "ice-candidate",
          candidate: event.candidate,
          roomId: roomId,
          userId: userIdRef.current,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case "connected":
          console.log("Peer connection established");
          break;
        case "disconnected":
          console.log("Peer connection disconnected");
          break;
        case "failed":
          console.error("Peer connection failed");
          break;
        default:
          console.log("Peer connection state:", pc.connectionState);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  }, [roomId, sendWsMessage]);

  // Memoize setupWebRTC to optimize performance
  const setupWebRTC = useCallback(async () => {
    // Close existing peer connection if it exists
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Create new peer connection
    const pc = createPeerConnection();
    peerConnectionRef.current = pc;

    try {
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isVideoOff,
        audio: !isMicMuted,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer via WebSocket
      sendWsMessage({
        type: "offer",
        offer: offer,
        roomId: roomId,
        userId: userIdRef.current,
      });
    } catch (error) {
      console.error("Error setting up WebRTC:", error);
    }
  }, [createPeerConnection, isVideoOff, isMicMuted, roomId, sendWsMessage]);

  // Send message handler
  const sendMessage = useCallback(() => {
    if (!ENABLE_CHAT || !newMessage.trim()) return;

    const message = {
      type: "chat",
      text: newMessage,
      sender: userIdRef.current,
      roomId: roomId,
      timestamp: new Date().toISOString(),
    };

    sendWsMessage(message);
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  }, [ENABLE_CHAT, newMessage, roomId, sendWsMessage]);

  // Toggle mic function
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMicMuted;
      });
      setIsMicMuted(!isMicMuted);
    }
  }, [localStreamRef, isMicMuted]);

  // Toggle video function
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [localStreamRef, isVideoOff]);

  // Handle receiving an answer from the remote peer
  const handleAnswer = useCallback(async (answer) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("Remote description set successfully");
      }
    } catch (error) {
      console.error("Error setting remote description:", error);
    }
  }, []);

  // Handle receiving ICE candidates
  const handleIceCandidate = useCallback((candidate) => {
    try {
      if (peerConnectionRef.current && candidate) {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
        console.log("ICE candidate added successfully");
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }, []);

  // WebRTC setup effect
  useEffect(() => {
    // Setup WebRTC
    setupWebRTC();

    // Cleanup function
    return () => {
      peerConnectionRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [setupWebRTC]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Connection Status and Error Display */}
      <div className="p-2 text-center bg-gray-100">
        Connection Status: {connectionStatus}
        {wsError && (
          <div className="text-red-500 ml-4">Error: {wsError.message}</div>
        )}
      </div>

      <div className="flex flex-grow">
        {/* Video Section */}
        <div
          className={`${ENABLE_CHAT ? "w-2/3" : "w-full"} p-4 flex flex-col`}
        >
          <div className="flex-grow flex space-x-4">
            <div className="w-1/2 bg-gray-200 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-1/2 bg-gray-200 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={toggleMic}
              className={`p-2 rounded-full ${
                isMicMuted ? "bg-red-500" : "bg-primary"
              } text-white`}
            >
              {isMicMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-full ${
                isVideoOff ? "bg-red-500" : "bg-primary"
              } text-white`}
            >
              {isVideoOff ? "Turn On Video" : "Turn Off Video"}
            </button>
          </div>
        </div>

        {/* Conditionally render chat section based on feature flag */}
        {ENABLE_CHAT && (
          <div className="w-1/3 bg-white p-4 border-l flex flex-col">
            {/* Participants Section */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">
                Participants ({participants.length})
              </h3>
              <div className="space-y-1">
                {participants.map((participant) => (
                  <div key={participant} className="text-sm text-gray-600">
                    {participant}
                  </div>
                ))}
              </div>
            </div>

            {/* Messages Section */}
            <div className="flex-grow overflow-y-auto mb-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded ${
                    msg.sender === userIdRef.current
                      ? "bg-primary text-white self-end"
                      : "bg-gray-200 text-black self-start"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-grow p-2 border rounded-l-lg"
              />
              <button
                onClick={sendMessage}
                className="bg-secondary text-white px-4 rounded-r-lg"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCallRoom;
