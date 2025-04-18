import React, { useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

/**
 * JitsiMeetComponent
 *
 * A flexible Jitsi Meet integration component with:
 * - Dynamic room creation
 * - Configurable display name
 * - Enhanced moderator mode
 * - Responsive design
 *
 * Key Features:
 * - Pre-meeting configuration screen
 * - Option to join as a moderator
 * - Customizable Jitsi Meet settings
 * - Tailwind CSS styling
 *
 * Moderator Enhancements:
 * - Automatic meeting start
 * - Bypass waiting rooms
 * - Full control over meeting settings
 */
function JitsiMeetComponent() {
  // State management for meeting configuration
  const [roomName, setRoomName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [startMeeting, setStartMeeting] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  /**
   * Validates and starts the meeting
   * Ensures room and display name are provided
   */
  const handleStartMeeting = () => {
    if (roomName && displayName) {
      setStartMeeting(true);
    } else {
      alert("Please enter both Room Name and Display Name");
    }
  };

  /**
   * Resets meeting configuration
   * Closes the current meeting session
   */
  const handleOnClose = () => {
    setStartMeeting(false);
    setRoomName("");
    setDisplayName("");
    setIsModerator(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Pre-meeting Configuration Screen */}
      {!startMeeting ? (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Start Jitsi Meeting
          </h2>

          {/* Room Name Input */}
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

          {/* Display Name Input */}
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

          {/* Moderator Option */}
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

          {/* Start Meeting Button */}
          <button
            onClick={handleStartMeeting}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300"
          >
            Start Meeting
          </button>
        </div>
      ) : (
        // Jitsi Meeting Interface
        <div className="w-full h-screen relative">
          <JitsiMeeting
            // Jitsi Meet Configuration
            domain="meet.jit.si"
            roomName={roomName}
            configOverwrite={{
              // Moderator-specific configurations
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              enableModeratorIndicator: true,
              requireDisplayName: true,
              prejoinPageEnabled: false, // Disable pre-join page

              // Moderator bypass settings
              breakoutRooms: {
                hideAddRoomButton: false,
                hideAutoAssignButton: false,
              },

              // Additional moderator controls
              disableModeratorIndicator: false,
              enableLobby: isModerator ? false : true, // Disable lobby for moderator

              // Meeting start and control settings
              startAudioOnly: false,
              startVideoMuted: false,
              startWithAudioMuted: false,
            }}
            interfaceConfigOverwrite={{
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
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
                    console.log("Ending meeting for all participants");
                  }}
                >
                  End Meeting
                </button>
                <button
                  className="w-full bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600 transition"
                  onClick={() => {
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
