import os
import time
import libtorrent as lt
from flask import Flask, request, jsonify, send_file
from flask_socketio import SocketIO
from flask_cors import CORS
from threading import Thread

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Torrent data directory
USER_DOWNLOADS = os.getenv("USER_DOWNLOADS", os.path.expanduser("~/Downloads"))
TORRENT_DOWNLOAD_PATH = os.path.join(USER_DOWNLOADS, "torrent-files")
if not os.path.exists(TORRENT_DOWNLOAD_PATH):
    os.makedirs(TORRENT_DOWNLOAD_PATH)

print(f"Torrents will be downloaded to: {TORRENT_DOWNLOAD_PATH}")

if not os.path.exists(USER_DOWNLOADS):
    print(f"USER_DOWNLOADS path does not exist: {USER_DOWNLOADS}")
    exit(1)


# Torrent management structures
torrent_handles = {}
sessions = {}

@app.route("/add-torrent", methods=["POST"])
def add_torrent():
    """Add a new torrent using a magnet link."""
    data = request.json
    magnet_link = data.get("magnetLink")

    print("Added a torrent - Magnet Link => ", magnet_link)

    session = lt.session()
    session.listen_on(6881, 6891)
    
    # Parse magnet link and add torrent
    print("Parsing Magnet link...")
    params = lt.parse_magnet_uri(magnet_link)
    params.save_path = TORRENT_DOWNLOAD_PATH
    handle = session.add_torrent(params)

    
    # Store handle and session
    torrent_handles[magnet_link] = handle
    sessions[magnet_link] = session


    print("Starting Downloading and Monitoring Progress...")
    # Start a thread to monitor progress
    thread = Thread(target=monitor_progress, args=(magnet_link, handle))
    thread.start()

    return jsonify({"status": "Torrent added", "magnetLink": magnet_link})



@app.route("/remove-torrent", methods=["POST"])
def remove_torrent():
    """Remove a torrent."""
    data = request.json
    magnet_link = data.get("magnetLink")
    print("Removing Torrent...")
    handle = torrent_handles.pop(magnet_link, None)
    session = sessions.pop(magnet_link, None)

    if handle:
        handle.pause()
        handle.auto_managed(False)
        session.remove_torrent(handle)
        print(f"Removed torrent: {magnet_link}")

    return jsonify({"status": "Torrent removed"})


def monitor_progress(magnet_link, handle):
    """Monitor torrent progress and emit real-time updates."""
    try:
        print("Starting the progress...")
        while not handle.status().is_seeding:
            status = handle.status()
            progress = status.progress * 100
            current_file = None

            # Check if metadata is available
            if status.has_metadata:
                torrent_info = handle.torrent_file()
                files = torrent_info.files()
                current_piece = next((i for i, x in enumerate(status.pieces) if x), None)

                if current_piece is not None:
                    piece_size = torrent_info.piece_length()
                    piece_offset = current_piece * piece_size

                    for i in range(files.num_files()):
                        file_start = files.file_offset(i)
                        file_end = file_start + files.file_size(i)
                        if file_start <= piece_offset < file_end:
                            current_file = files.file_path(i)
                            break
            print("Progress => ", progress)
            # Emit progress and current file name
            socketio.emit(
                "progress",
                {
                    "magnetLink": magnet_link,
                    "progress": progress,
                    "currentFile": current_file,
                },
            )
            time.sleep(1)

        print("Download Completed")
        # Emit completion event
        socketio.emit(
            "completed",
            {"magnetLink": magnet_link, "status": "Download completed"},
        )

    except Exception as e:
        print(f"Error in monitor_progress for {magnet_link}: {e}")


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})



if __name__ == "__main__":
    socketio.run(app,debug=True, port=5000, host='0.0.0.0',  allow_unsafe_werkzeug=True)
