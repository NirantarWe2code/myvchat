import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * HomePage Component
 *
 * Landing page for the video communication application
 *
 * Key Features:
 * - Create new video call room
 * - Join existing room by ID
 * - 8x8 Jitsi Meet integration
 * - Dynamic app naming via environment variables
 * - Responsive design with Tailwind CSS
 *
 * Workflow:
 * 1. User can create a new room automatically
 * 2. User can join an existing room by entering room ID
 * 3. Option to start 8x8 Jitsi Meet meeting
 *
 * Environment Variables:
 * - REACT_APP_API_BASE_URL: Backend API endpoint
 * - REACT_APP_APP_NAME: Custom application name
 */
function HomePage() {
  // State management for room ID input
  const [roomId, setRoomId] = useState("");
  const [showJitsiMeet, setShowJitsiMeet] = useState(false);

  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  // API base URL with fallback
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://apichat.doc247.ca";

  // 8x8 Jitsi Meet configuration
  const JITSI_ROOM_NAME =
    "vpaas-magic-cookie-a4111ebeampleAppPoliteFactionsWarnUndoubtedly";

  // Load external Jitsi Meet script
  useEffect(() => {
    if (showJitsiMeet) {
      const script = document.createElement("script");
      script.src = "https://8x8.vc/external_api.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.JitsiMeetExternalAPI) {
          const api = new window.JitsiMeetExternalAPI("8x8.vc", {
            roomName: JITSI_ROOM_NAME,
            parentNode: document.querySelector("#jaas-container"),
            // Uncomment and add JWT for premium features
            // jwt: "your-jwt-token"

            // Additional configuration options
            width: "100%",
            height: "100%",
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
            },
          });

          // Optional: Add event listeners
          api.on("readyToClose", () => {
            setShowJitsiMeet(false);
          });
        }
      };

      // Cleanup script on component unmount
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showJitsiMeet]);

  /**
   * Creates a new video call room
   * Sends request to backend to generate a unique room ID
   * Navigates to the newly created room
   */
  const createNewRoom = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/create-room`);
      const data = await response.json();
      navigate(`/room/${data.room_id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  /**
   * Joins an existing room
   * Validates room ID and navigates to the specified room
   */
  const joinExistingRoom = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  // Render Jitsi Meet container
  if (showJitsiMeet) {
    return (
      <div className="fixed inset-0 z-50">
        <div
          id="jaas-container"
          className="w-full h-full"
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <button
          onClick={() => setShowJitsiMeet(false)}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded z-60"
        >
          Close Meeting
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      {/* Dynamic Application Title */}
      <h1 className="text-4xl font-bold mb-8 text-primary">
        {process.env.REACT_APP_APP_NAME || "Video Call App"}
      </h1>

      {/* Room Creation and Joining Container */}
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8 space-y-4">
        {/* Create New Room Button */}
        <button
          onClick={createNewRoom}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Create New Room
        </button>

        {/* 8x8 Jitsi Meet Button */}
        <button
          onClick={() => setShowJitsiMeet(true)}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Start 8x8 Jitsi Meet
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Join Existing Room Section */}
        <div className="flex">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-l-lg"
          />
          <button
            onClick={joinExistingRoom}
            className="bg-secondary text-white px-4 py-2 rounded-r-lg hover:bg-green-700 transition duration-300"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
