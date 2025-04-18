import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://apichat.doc247.ca";

  const createNewRoom = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/create-room`);
      const data = await response.json();
      navigate(`/room/${data.room_id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const joinExistingRoom = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-8 text-primary">
        {process.env.REACT_APP_APP_NAME || "Video Call App"}
      </h1>

      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8">
        <button
          onClick={createNewRoom}
          className="w-full bg-primary text-white py-3 rounded-lg mb-4 hover:bg-blue-700 transition duration-300"
        >
          Create New Room
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

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
