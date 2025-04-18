import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./components/HomePage";
import VideoCallRoom from "./components/VideoCallRoom";
import JitsiMeetComponent from "./components/JitsiMeetComponent";
import "./App.css";
import "./index.css";

/**
 * Main Application Component
 *
 * Provides routing and navigation for the video communication application
 *
 * Routes:
 * - '/' : Home page
 * - '/room/:roomId' : Custom WebRTC Video Call Room
 * - '/jitsi-meet' : Jitsi Meet Integration
 *
 * Features:
 * - Navigation menu with links to different video communication modes
 * - Responsive routing using React Router
 * - Tailwind CSS for styling
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* Main Navigation Menu */}
        <nav className="bg-primary text-white p-4">
          <ul className="flex space-x-4">
            {/* Home Page Link */}
            <li>
              <Link
                to="/"
                className="hover:text-secondary transition duration-300"
              >
                Home
              </Link>
            </li>
            {/* Custom Video Call Room Link */}
            <li>
              <Link
                to="/room/:roomId"
                className="hover:text-secondary transition duration-300"
              >
                Custom Video Call
              </Link>
            </li>
            {/* Jitsi Meet Integration Link */}
            <li>
              <Link
                to="/jitsi-meet"
                className="hover:text-secondary transition duration-300"
              >
                Jitsi Meet
              </Link>
            </li>
          </ul>
        </nav>

        {/* Route Definitions */}
        <Routes>
          {/* Home Page Route */}
          <Route path="/" element={<HomePage />} />

          {/* Custom Video Call Room Route with Dynamic Room ID */}
          <Route path="/room/:roomId" element={<VideoCallRoom />} />

          {/* Jitsi Meet Integration Route */}
          <Route path="/jitsi-meet" element={<JitsiMeetComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
