import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

function VideoCallRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const websocketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    // WebSocket connection
    const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}`);
    websocketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Handle WebRTC signaling
      if (
        message.type === "offer" ||
        message.type === "answer" ||
        message.type === "ice-candidate"
      ) {
        handleSignalingData(message);
      } else if (message.type === "chat") {
        setMessages((prev) => [...prev, message]);
      }
    };

    // WebRTC setup
    setupWebRTC();

    return () => {
      ws.close();
      peerConnectionRef.current?.close();
    };
  }, [roomId]);

  const setupWebRTC = async () => {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    // Get local media stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isVideoOff,
        audio: !isMicMuted,
      });

      localVideoRef.current.srcObject = stream;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        websocketRef.current.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
          })
        );
      }
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    websocketRef.current.send(JSON.stringify(offer));
  };

  const handleSignalingData = async (message) => {
    const pc = peerConnectionRef.current;

    if (message.type === "offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(message));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      websocketRef.current.send(JSON.stringify(answer));
    } else if (message.type === "answer") {
      await pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === "ice-candidate") {
      await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        type: "chat",
        text: newMessage,
        sender: "Me",
        timestamp: new Date().toISOString(),
      };

      websocketRef.current.send(JSON.stringify(message));
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  };

  const toggleMic = () => {
    const stream = localVideoRef.current.srcObject;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = isMicMuted;
    });
    setIsMicMuted(!isMicMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current.srcObject;
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = isVideoOff;
    });
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Video Section */}
      <div className="w-2/3 p-4 flex flex-col">
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

      {/* Chat Section */}
      <div className="w-1/3 bg-white p-4 border-l flex flex-col">
        <div className="flex-grow overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${
                msg.sender === "Me"
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
    </div>
  );
}

export default VideoCallRoom;
