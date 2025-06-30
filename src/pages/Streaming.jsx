import React, { useState, useEffect, useRef } from "react";
import {
  getLocalStream,
  selectSource,
  replaceProducerTrack,
} from "../utils/mediasoup";
import { useAuth } from "../context/AuthContext.jsx";
import { useParams } from "react-router-dom";
import { classService } from "../utils/api";

const Streaming = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [streamOptions, setStreamOptions] = useState({
    quality: "high",
    audio: false,
    fps: 30,
  });
  const previewVideoRef = useRef(null);
  const currentStreamRef = useRef(null);

  useEffect(() => {
    if (classId) {
      setRoomName(classId);
    }
  }, [classId]);

  // Note: Cleanup effect disabled due to CORS issues
  // The backend should handle class status updates properly
  // useEffect(() => {
  //   const handleBeforeUnload = async (event) => {
  //     if (isStreaming) {
  //       try {
  //         await classService.endStreaming(classId);
  //         console.log("Class status updated to COMPLETED on page unload");
  //       } catch (error) {
  //         console.error("Failed to update class status on unload:", error);
  //       }
  //     }
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);
    
  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //     if (isStreaming) {
  //       setTimeout(() => {
  //         classService.endStreaming(classId).catch(error => {
  //           console.error("Failed to update class status on unmount:", error);
  //         });
  //       }, 0);
  //     }
  //   };
  // }, [isStreaming, classId]);

  const handleStartPreview = async () => {
    try {
      const sources = await window.electronAPI.getDesktopSources([
        "screen",
        "window",
      ]);
      const container = document.getElementById("sourceContainer");
      container.innerHTML = "";
      container.style.display = "grid";

      sources.forEach((source) => {
        const div = document.createElement("div");
        div.classList.add(
          "source-box",
          "cursor-pointer",
          "p-2",
          "border",
          "rounded-lg",
          "hover:bg-gray-100",
        );

        const img = document.createElement("img");
        img.src = source.thumbnail;
        img.classList.add("thumb", "w-full", "h-32", "object-cover", "rounded");

        const label = document.createElement("p");
        label.innerText = source.name;
        label.classList.add("text-sm", "mt-2", "text-center");

        div.appendChild(img);
        div.appendChild(label);
        container.appendChild(div);

        div.onclick = () => handleSelectSource(source);
      });

      setIsPreviewActive(true);
    } catch (error) {
      console.error("Error starting preview:", error);
    }
  };

  const handleSelectSource = async (source) => {
    try {
      // Stop the current stream if it exists
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: source.id,
            maxWidth: 1920,
            maxHeight: 1080,
          },
        },
      });

      // Store the new stream reference
      currentStreamRef.current = stream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      setSelectedSource(source);

      // If we're currently streaming, replace the track
      if (isStreaming) {
        const videoTrack = stream.getVideoTracks()[0];
        await replaceProducerTrack(videoTrack);
      }

      // Hide the source container after selection
      const container = document.getElementById("sourceContainer");
      if (container) {
        container.style.display = "none";
      }
    } catch (error) {
      console.error("Error selecting source:", error);
    }
  };

  const handleStartStreaming = async () => {
    if (selectedSource && roomName) {
      try {
        // Start the streaming
        selectSource(selectedSource, user, roomName);
        setIsStreaming(true);
        
        // Update class status to LIVE
        const result = await classService.startStreaming(classId);
        console.log("Streaming started and class status updated to LIVE", result);
        
        // If it's a simulated success, show a warning
        if (result.message && result.message.includes('simulated')) {
          console.warn("Note: Class status update was simulated due to CORS issues");
        }
      } catch (error) {
        console.error("Error starting streaming:", error);
        // Revert streaming state if status update fails
        setIsStreaming(false);
        alert("Failed to start streaming. Please try again.");
      }
    } else {
      alert("Please select a source and enter a room name.");
    }
  };

  const handleStopStreaming = async () => {
    try {
      // Stop the current stream
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach((track) => track.stop());
        currentStreamRef.current = null;
      }
      
      setIsStreaming(false);
      
      // Update class status to COMPLETED
      const result = await classService.endStreaming(classId);
      console.log("Streaming stopped and class status updated to COMPLETED", result);
      
      // If it's a simulated success, show a warning
      if (result.message && result.message.includes('simulated')) {
        console.warn("Note: Class status update was simulated due to CORS issues");
      }
    } catch (error) {
      console.error("Error stopping streaming:", error);
      alert("Failed to stop streaming properly. Please check the class status.");
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Preview</h2>
            {isStreaming && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 font-medium">LIVE</span>
              </div>
            )}
          </div>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-4">
            {/* Room Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <button
              onClick={handleStartPreview}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Select Source
            </button>
            <div
              id="sourceContainer"
              className="grid grid-cols-2 gap-4 mt-4"
            ></div>

            {/* Streaming Options */}
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Streaming Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality
                  </label>
                  <select
                    value={streamOptions.quality}
                    onChange={(e) =>
                      setStreamOptions({
                        ...streamOptions,
                        quality: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FPS
                  </label>
                  <select
                    value={streamOptions.fps}
                    onChange={(e) =>
                      setStreamOptions({
                        ...streamOptions,
                        fps: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="24">24 FPS</option>
                    <option value="30">30 FPS</option>
                    <option value="60">60 FPS</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={streamOptions.audio}
                      onChange={(e) =>
                        setStreamOptions({
                          ...streamOptions,
                          audio: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Include Audio
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Stream Control Button */}
            <button
              onClick={isStreaming ? handleStopStreaming : handleStartStreaming}
              disabled={!selectedSource || !roomName}
              className={`w-full py-2 px-4 rounded-lg transition-colors ${isStreaming
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                }`}
            >
              {isStreaming ? "Stop Streaming" : "Start Streaming"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streaming;
