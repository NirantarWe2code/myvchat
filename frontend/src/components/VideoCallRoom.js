import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams } from "react-router-dom";

function VideoCallRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const websocketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const userIdRef = useRef(null);

  // Memoize createPeerConnection to prevent unnecessary recreations
  const createPeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        websocketRef.current?.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            roomId: roomId,
            userId: userIdRef.current,
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case "connected":
          setConnectionStatus("Connected");
          break;
        case "disconnected":
          setConnectionStatus("Disconnected");
          break;
        case "failed":
          setConnectionStatus("Connection Failed");
          break;
        default:
          setConnectionStatus("Connecting...");
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  }, [roomId]);

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
      websocketRef.current?.send(
        JSON.stringify({
          type: "offer",
          offer: offer,
          roomId: roomId,
          userId: userIdRef.current,
        })
      );
    } catch (error) {
      console.error("Error setting up WebRTC:", error);
      setConnectionStatus("Error setting up connection");
    }
  }, [createPeerConnection, isVideoOff, isMicMuted, roomId]);

  // Memoize message sending function
  const sendMessage = useCallback(() => {
    if (!ENABLE_CHAT) {
      console.warn("Chat is currently disabled");
      return;
    }

    if (newMessage.trim() && websocketRef.current) {
      const message = {
        type: "chat",
        text: newMessage,
        sender: userIdRef.current,
        roomId: roomId,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending chat message:", message);
      websocketRef.current.send(JSON.stringify(message));
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  }, [ENABLE_CHAT, newMessage, roomId]);

  // WebSocket and WebRTC setup effect
  useEffect(() => {
    // Generate a unique user ID if not already set
    if (!userIdRef.current) {
      userIdRef.current = `user-${Math.random().toString(36).substr(2, 9)}`;
    }

    // WebSocket connection
    const ws = new WebSocket(`${WS_BASE_URL}/ws/${roomId}`);
    websocketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setConnectionStatus("Connected to WebSocket");

      // Send a join room message
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomId,
          userId: userIdRef.current,
        })
      );
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received WebSocket message:", message);

        switch (message.type) {
          case "offer":
            // Only process offer if it's not from our own connection
            if (message.userId !== userIdRef.current) {
              const pc = peerConnectionRef.current || createPeerConnection();
              await pc.setRemoteDescription(
                new RTCSessionDescription(message.offer)
              );
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(
                JSON.stringify({
                  type: "answer",
                  answer: answer,
                  roomId: roomId,
                  userId: userIdRef.current,
                })
              );
            }
            break;

          case "answer":
            // Only process answer if it's not from our own connection
            if (message.userId !== userIdRef.current) {
              await peerConnectionRef.current?.setRemoteDescription(
                new RTCSessionDescription(message.answer)
              );
            }
            break;

          case "ice-candidate":
            // Only process ICE candidate if it's not from our own connection
            if (message.userId !== userIdRef.current) {
              await peerConnectionRef.current?.addIceCandidate(
                new RTCIceCandidate(message.candidate)
              );
            }
            break;

          case "chat":
            if (ENABLE_CHAT) {
              console.log("Received chat message:", message);
              setMessages((prev) => {
                // Prevent duplicate messages
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
            console.log("Updated participants:", message.participants);
            setParticipants(message.participants);
            break;

          default:
            console.log("Unhandled message type:", message.type);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("WebSocket Error");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setConnectionStatus("Disconnected");
    };

    // Setup WebRTC
    setupWebRTC();

    // Cleanup function
    return () => {
      ws.close();
      peerConnectionRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, setupWebRTC, createPeerConnection, WS_BASE_URL, ENABLE_CHAT]);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Connection Status */}
      <div className="p-2 text-center bg-gray-100">
        Connection Status: {connectionStatus}
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
