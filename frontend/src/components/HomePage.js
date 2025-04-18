import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * HomePage Component
 *
 * Landing page for the video communication application
 *
 * Key Features:
 * - Create new video call room
 * - Join existing room by ID
 * - Dynamic app naming via environment variables
 * - Responsive design with Tailwind CSS
 *
 * Workflow:
 * 1. User can create a new room automatically
 * 2. User can join an existing room by entering room ID
 *
 * Environment Variables:
 * - REACT_APP_API_BASE_URL: Backend API endpoint
 * - REACT_APP_APP_NAME: Custom application name
 */
function HomePage() {
  // State management for room ID input
  const [roomId, setRoomId] = useState("");

  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  // API base URL with fallback
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://apichat.doc247.ca";

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

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      {/* Dynamic Application Title */}
      <h1 className="text-4xl font-bold mb-8 text-primary">
        {process.env.REACT_APP_APP_NAME || "Video Call App"}
      </h1>

      {/* Room Creation and Joining Container */}
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Create New Room Button */}
        <button
          onClick={createNewRoom}
          className="w-full bg-primary text-white py-3 rounded-lg mb-4 hover:bg-blue-700 transition duration-300"
        >
          Create New Room
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
