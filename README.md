
# 🌟 Torrent Downloader

A lightweight, Dockerized Torrent Downloader application with a React.js frontend and Flask backend. Easily manage and download torrents with an elegant and simple interface.


## 🛠️ Prerequisites
Before running the application, ensure you have docker installed.

**Docker**: [Install Docker](https://docs.docker.com/get-docker/)




## ⚙️ Setting the `USER_DOWNLOADS` Environment Variable
The application requires the `USER_DOWNLOADS` environment variable to specify the downloads directory. Set it according to your operating system:
### **Windows**
1. Open Command Prompt or PowerShell as **Admin**.
2. Set the variable:
   ```powershell
   setx USER_DOWNLOADS "C:/Users/<Your_Username>\Downloads" /M
3. Restart the terminal for the variable to take effect.

### **Linux/MacOS**
1. Open a terminal.
2. Set the variable temporarily:
    ```bash
    export USER_DOWNLOADS=~/Downloads
3. To set it permanently, add the following to ~/.bashrc (Linux) or ~/.zshrc (Mac):
    ```bash
    export USER_DOWNLOADS=~/Downloads
4. Reload the terminal configuration:
    ```bash
    source ~/.bashrc  # For bash
    source ~/.zshrc   # For zsh

## 🚀 How to Run
### For Windows Terminal (Not Git Bash)

Run the Following commands:
1. ```powershell
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/lakshya018/torrent-downloader/Main/docker-compose.yml" -OutFile "docker-compose.yml"

2. ```powershell
    docker-compose -f docker-compose.yml up

### Linux/MacOS/Git-Bash

Run the following command:

    curl -sSL https://raw.githubusercontent.com/lakshya018/torrent-downloader/Main/docker-compose.yml | docker-compose -f - up








## Run http://localhost:3000 in your browser after that.
## Files will be downloaded in "torrent-files" folder in Downloads.
