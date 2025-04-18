import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./components/HomePage";
import VideoCallRoom from "./components/VideoCallRoom";
import JitsiMeetComponent from "./components/JitsiMeetComponent";
import "./App.css";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <nav className="bg-primary text-white p-4">
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/"
                className="hover:text-secondary transition duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/room/:roomId"
                className="hover:text-secondary transition duration-300"
              >
                Custom Video Call
              </Link>
            </li>
            <li>
              {/*  */}
              <Link
                to="/jitsi-meet"
                className="hover:text-secondary transition duration-300"
              >
                Jitsi Meet
              </Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<VideoCallRoom />} />
          <Route path="/jitsi-meet" element={<JitsiMeetComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
