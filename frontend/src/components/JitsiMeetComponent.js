import React, { useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

function JitsiMeetComponent() {
  const [roomName, setRoomName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [startMeeting, setStartMeeting] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  const handleStartMeeting = () => {
    if (roomName && displayName) {
      setStartMeeting(true);
    } else {
      alert("Please enter both Room Name and Display Name");
    }
  };

  const handleOnClose = () => {
    setStartMeeting(false);
    setRoomName("");
    setDisplayName("");
    setIsModerator(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {!startMeeting ? (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Start Jitsi Meeting
          </h2>
          <div className="mb-4">
            <label
              htmlFor="roomName"
              className="block text-sm font-medium text-gray-700"
            >
              Room Name
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter room name"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700"
            >
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter your display name"
              required
            />
          </div>
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="moderator"
              checked={isModerator}
              onChange={(e) => setIsModerator(e.target.checked)}
              className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="moderator"
              className="text-sm font-medium text-gray-700"
            >
              Join as Moderator
            </label>
          </div>
          <button
            onClick={handleStartMeeting}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300"
          >
            Start Meeting
          </button>
        </div>
      ) : (
        <div className="w-full h-screen relative">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={roomName}
            configOverwrite={{
              startWithAudioMuted: true,
              startWithVideoMuted: false,
              // Moderator-specific configurations
              enableModeratorIndicator: true,
              requireDisplayName: true,
              prejoinPageEnabled: true,
            }}
            interfaceConfigOverwrite={{
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              // Additional moderator interface configurations
              TOOLBAR_BUTTONS: [
                "microphone",
                "camera",
                "closedcaptions",
                "desktop",
                "fullscreen",
                "fodeviceselection",
                "hangup",
                "profile",
                "chat",
                "recording",
                "livestreaming",
                "etherpad",
                "sharedvideo",
                "settings",
                "raisehand",
                "videoquality",
                "filmstrip",
                "invite",
                "feedback",
                "stats",
                "shortcuts",
                "tileview",
                "videobackgroundblur",
              ],
            }}
            userInfo={{
              displayName: displayName,
              // Set moderator status
              moderator: isModerator,
            }}
            onReadyToClose={handleOnClose}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "100%";
              iframeRef.style.width = "100%";
            }}
            // Moderator-specific event handlers
            onMeetingEnd={() => {
              console.log("Meeting ended");
              handleOnClose();
            }}
          />
          {/* Moderator Control Overlay */}
          {isModerator && (
            <div className="absolute top-4 right-4 bg-white shadow-md rounded-lg p-4 z-50">
              <h3 className="font-bold mb-2 text-primary">
                Moderator Controls
              </h3>
              <div className="space-y-2">
                <button
                  className="w-full bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition"
                  onClick={() => {
                    // Implement end meeting for all participants
                    console.log("Ending meeting for all participants");
                  }}
                >
                  End Meeting
                </button>
                <button
                  className="w-full bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600 transition"
                  onClick={() => {
                    // Implement mute all participants
                    console.log("Muting all participants");
                  }}
                >
                  Mute All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default JitsiMeetComponent;
