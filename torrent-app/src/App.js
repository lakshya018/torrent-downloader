import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const api_url = process.env.React_APP_API_URL || "http://localhost:5500"
const socket = io(api_url);

const App = () => {
  const [magnetLink, setMagnetLink] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState([]);
  const [currentFile, setCurrentFile] = useState("");

  const addTorrent = async () => {
    try {
      const response = await fetch(`${api_url}/add-torrent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magnetLink }),
      });

      await response.json();
      setStatus("Torrent added. Downloading...");
      setLogs((prevLogs) => [...prevLogs, `Torrent added: ${magnetLink}`]);
    } catch (error) {
      console.error("Error adding torrent:", error);
      setStatus("Error adding torrent");
    }
  };

  const removeTorrent = async () => {
    try {
      const response = await fetch(`${api_url}/remove-torrent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magnetLink }),
      });

      await response.json();
      setStatus("Torrent removed.");
      setTimeout(() => {
        setStatus(""); // Reset status to null after 2 seconds
      }, 2000);
      setProgress(0);
      setCurrentFile("");
      setMagnetLink("");
      setLogs((prevLogs) => [...prevLogs, "Torrent removed."]);
    } catch (error) {
      console.error("Error removing torrent:", error);
      setStatus("Error removing torrent");
    }
  };

  useEffect(() => {
    socket.on("progress", (data) => {
      if (data.magnetLink === magnetLink) {
        setProgress(data.progress);
        if (data.currentFile) {
          setCurrentFile(data.currentFile);
          setLogs((prevLogs) => [
            ...prevLogs,
            `Downloading: (${data.progress.toFixed(2)}%)`,
          ]);
        }
      }
    });

    socket.on("completed", (data) => {
      if (data.magnetLink === magnetLink) {
        setStatus(data.status);
        setLogs((prevLogs) => [...prevLogs, "Download completed."]);
      }
    });

    return () => {
      socket.off("progress");
      socket.off("completed");
    };
  }, [magnetLink]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex flex-col items-center">
        <input
          type="text"
          placeholder="Enter Magnet Link"
          value={magnetLink}
          onChange={(e) => setMagnetLink(e.target.value)}
          className="w-full max-w-lg p-2 rounded bg-gray-800 text-white"
          disabled={status && status !== "Download completed"} // Disable input during download
        />
        <button
          onClick={addTorrent}
          className={`mt-4 p-2 rounded text-white ${status && status !== "Download completed"
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-pink-500 hover:bg-pink-600"
            }`}
          disabled={status && status !== "Download completed"} // Disable button during download
        >
          Add Torrent
        </button>

        {status && (
          <div className="mt-6 bg-gray-800 p-4 rounded shadow-lg max-w-lg w-full flex items-center space-x-4">
            <div>
              {status && status !== "Download completed" && (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-400"></div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-pink-400">Status</h3>
              <p className="text-white mt-1">{status}</p>
            </div>
          </div>
        )}

        {progress > 0 && (
          <div className="mt-6 bg-gray-800 p-4 rounded shadow-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold text-blue-400">Download Progress</h3>
            <p className="text-white mt-2">
              <span className="font-bold">{progress.toFixed(2)}%</span>
            </p>
            {currentFile && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-green-400">Current File</h4>
                <p className="text-white mt-1 italic">{currentFile}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={removeTorrent}
          className="mt-4 p-2 bg-red-500 rounded text-white hover:bg-red-600"
        >
          Remove Torrent
        </button>


        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-lg font-bold mb-4">Logs</h2>
          <div className="bg-gray-800 p-4 rounded overflow-auto max-h-64">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="text-sm mb-2 border-b border-gray-700 pb-2"
                >
                  {log}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No logs available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
