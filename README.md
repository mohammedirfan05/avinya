# Avinya - AI-Powered Traffic Management System

<div align="center">
  <h3>Real-time Traffic Monitoring, Analysis & Emergency Corridor Management</h3>
  <p>Built with React, TypeScript, FastAPI, and YOLO</p>
</div>

## 📋 Table of Contents
- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [Architecture](#architecture)
- [License](#license)
- [Contact](#contact)

## 🚀 About The Project

Avinya is a comprehensive AI-powered traffic management platform that enables real-time vehicle detection, tracking, counting, and emergency corridor management. It combines computer vision with a modern web interface to provide intelligent traffic analytics.

## ✨ Features

- **Real-time Traffic Monitoring**: Live video processing with vehicle detection and tracking using YOLO
- **Vehicle Counting**: Automatic counting of cars, motorcycles, buses, and trucks
- **WebSocket Streaming**: Real-time annotated video feed to the frontend
- **Emergency Corridor Management**: Smart traffic signal control for emergency vehicles
- **Incident Reporting**: Log and manage traffic incidents
- **Analytics Dashboard**: Visual traffic statistics and trends
- **Sensor Health Monitoring**: Track system sensor status
- **Signal Control**: Manual and automatic traffic signal management
- **Sustainability Metrics**: Environmental impact monitoring

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs with Python
- **Ultralytics YOLO**: State-of-the-art object detection and tracking
- **OpenCV**: Computer vision library for video processing
- **WebSockets**: Real-time bidirectional communication

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing

## 📦 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

## 🔧 Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   # source venv/bin/activate  # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Download the YOLO model (if not present):
   - The system uses `yolo26n.pt`, place it in the `backend/` directory

5. Start the backend server:
   ```bash
   python main.py
   ```
   The backend will be available at `http://localhost:8000`

## 🎨 Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## 💻 Usage

### Running the Complete Application

1. Start the backend server (from `backend/` directory):
   ```bash
   python main.py
   ```

2. Start the frontend dev server (from `frontend/` directory):
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Traffic Monitoring

1. Go to the **Traffic Monitoring** page
2. Select your video source:
   - **Webcam**: Use your default camera
   - **Upload Video**: Upload a video file for analysis
3. Click "Start Analysis" to begin processing
4. View real-time vehicle detection, tracking, and statistics

### Other Features

- **Dashboard**: Overview of traffic stats and system status
- **Analytics**: Detailed traffic analysis and trends
- **Emergency Corridor**: Manage emergency vehicle priority
- **Incident Reports**: Log and track traffic incidents
- **Reports**: Generate and view traffic reports
- **Sensor Health**: Monitor system sensors
- **Settings**: Configure system preferences

## 🏗️ Architecture

```
avinya/
├── backend/
│   ├── main.py              # FastAPI application with WebSocket support
│   ├── traffic_analyzer.py  # Standalone traffic analysis script
│   ├── analyzer.py          # Additional analysis utilities
│   ├── requirements.txt     # Python dependencies
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and WebSocket services
│   │   ├── layouts/         # Layout components
│   │   └── lib/             # Utility functions
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## 📄 License

This project is for educational and development purposes.

## 📞 Contact

Mohammed Irfan - [mohammediirfan2006@gmail.com](mailto:mohammediirfan2006@gmail.com)

Project Link: [https://github.com/mohammedirfan05/avinya](https://github.com/mohammedirfan05/avinya)
