import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import VideoCallRoom from "./components/VideoCallRoom";
import "./App.css";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<VideoCallRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
