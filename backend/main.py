from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import asyncio
import time
import threading
import cv2
import os
import uuid
from ultralytics import YOLO
from collections import defaultdict
import base64
import json
from queue import Queue

from fastapi.staticfiles import StaticFiles
from routers import incidents, routing, matrix

app = FastAPI(title="Civic Sense AI Traffic API")

# Include routers
app.include_router(incidents.router, prefix="/api")
app.include_router(routing.router, prefix="/api")
app.include_router(matrix.router, prefix="/api")

# Serve uploaded incident images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class TrafficStats(BaseModel):
    total_count: int = 0
    direction_counts: Dict[str, int] = {}
    class_counts: Dict[str, int] = {}
    fps: float = 0.0
    processed_frames: int = 0
    source: str = "webcam"
    running: bool = False
    active_connections: int = 0

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.message_queue = Queue()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections.copy():
            try:
                await connection.send_json(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

VEHICLE_CLASS_IDS = [2, 3, 5, 7]
VEHICLE_CLASS_NAMES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

class TrafficAnalyzer:
    def __init__(self):
        self.running = False
        self.stats = TrafficStats()
        self.thread: Optional[threading.Thread] = None
        self.model: Optional[YOLO] = None
        self.video_source: Optional[str] = None
        self.source_type: str = "webcam"
        self.loop: Optional[asyncio.AbstractEventLoop] = None

    def start(self, source: Optional[str] = None, source_type: str = "webcam"):
        if self.running:
            return
        self.running = True
        self.video_source = source if source else 0
        self.source_type = source_type
        self.loop = asyncio.get_running_loop()
        self.model = YOLO("yolov8n.pt")
        self.thread = threading.Thread(target=self._process_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False

    def reset_stats(self):
        self.stats = TrafficStats()

    def _process_loop(self):
        class_counts = defaultdict(int)
        direction_counts = defaultdict(int)
        counted_track_ids = set()
        direction_assigned_ids = set()
        previous_centroids: Dict[int, tuple[float, float]] = {}
        next_temp_track_id = 1
        frame_count = 0
        raw_frame_count = 0
        fps_window_start = time.perf_counter()
        PROCESS_EVERY_N_FRAMES = 3
        SEND_FRAME_EVERY_N = 2
        JPEG_QUALITY = 55
        DIRECTION_THRESHOLD = 18.0
        
        cap = cv2.VideoCapture(self.video_source)
        
        try:
            while self.running:
                ret, frame = cap.read()
                if not ret:
                    if isinstance(self.video_source, str) and os.path.exists(self.video_source):
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        frame_count = 0
                        continue
                    else:
                        break

                annotated_frame = frame
                
                if frame_count % PROCESS_EVERY_N_FRAMES == 0:
                    results = self.model.track(frame, conf=0.3, imgsz=416, classes=VEHICLE_CLASS_IDS, persist=True, verbose=False)
                    
                    if results and len(results) > 0:
                        result = results[0]
                        annotated_frame = result.plot()

                        if result.boxes is not None and result.boxes.xyxy is not None:
                            box_data = result.boxes.xyxy.cpu().numpy()
                            class_ids = result.boxes.cls.cpu().numpy().astype(int)
                            tracked_ids = None
                            if result.boxes.id is not None:
                                tracked_ids = result.boxes.id.cpu().numpy().astype(int)

                            current_centroids: Dict[int, tuple[float, float]] = {}
                            if tracked_ids is not None:
                                for track_id, class_id, box in zip(tracked_ids, class_ids, box_data):
                                    x1, y1, x2, y2 = box
                                    centroid = ((x1 + x2) / 2.0, (y1 + y2) / 2.0)
                                    current_centroids[int(track_id)] = centroid
                                    if int(track_id) not in counted_track_ids:
                                        counted_track_ids.add(int(track_id))
                                        class_name = VEHICLE_CLASS_NAMES.get(int(class_id), "vehicle")
                                        class_counts[class_name] += 1

                                    previous_centroid = previous_centroids.get(int(track_id))
                                    if previous_centroid and int(track_id) not in direction_assigned_ids:
                                        dx = centroid[0] - previous_centroid[0]
                                        dy = centroid[1] - previous_centroid[1]
                                        if abs(dx) >= DIRECTION_THRESHOLD or abs(dy) >= DIRECTION_THRESHOLD:
                                            direction = "right" if abs(dx) >= abs(dy) and dx > 0 else "left" if abs(dx) >= abs(dy) else "down" if dy > 0 else "up"
                                            direction_counts[direction] += 1
                                            direction_assigned_ids.add(int(track_id))

                                previous_centroids = current_centroids
                            else:
                                for box, class_id in zip(box_data, class_ids):
                                    x1, y1, x2, y2 = box
                                    centroid = ((x1 + x2) / 2.0, (y1 + y2) / 2.0)
                                    matched_track_id = None
                                    matched_distance = float("inf")

                                    for existing_track_id, previous_centroid in previous_centroids.items():
                                        distance = ((centroid[0] - previous_centroid[0]) ** 2 + (centroid[1] - previous_centroid[1]) ** 2) ** 0.5
                                        if distance < matched_distance and distance < 60:
                                            matched_distance = distance
                                            matched_track_id = existing_track_id

                                    if matched_track_id is None:
                                        matched_track_id = next_temp_track_id
                                        next_temp_track_id += 1

                                    current_centroids[matched_track_id] = centroid
                                    if matched_track_id not in counted_track_ids:
                                        counted_track_ids.add(matched_track_id)
                                        class_name = VEHICLE_CLASS_NAMES.get(int(class_id), "vehicle")
                                        class_counts[class_name] += 1

                                    previous_centroid = previous_centroids.get(matched_track_id)
                                    if previous_centroid and matched_track_id not in direction_assigned_ids:
                                        dx = centroid[0] - previous_centroid[0]
                                        dy = centroid[1] - previous_centroid[1]
                                        if abs(dx) >= DIRECTION_THRESHOLD or abs(dy) >= DIRECTION_THRESHOLD:
                                            direction = "right" if abs(dx) >= abs(dy) and dx > 0 else "left" if abs(dx) >= abs(dy) else "down" if dy > 0 else "up"
                                            direction_counts[direction] += 1
                                            direction_assigned_ids.add(matched_track_id)

                                previous_centroids = current_centroids

                raw_frame_count += 1
                elapsed = max(time.perf_counter() - fps_window_start, 1e-6)
                current_fps = raw_frame_count / elapsed
                self.stats.total_count = len(counted_track_ids)
                self.stats.direction_counts = dict(direction_counts)
                self.stats.class_counts = dict(class_counts)
                self.stats.fps = round(current_fps, 1)
                self.stats.processed_frames = raw_frame_count
                self.stats.source = self.source_type
                self.stats.running = self.running
                self.stats.active_connections = len(manager.active_connections)
                
                if frame_count % SEND_FRAME_EVERY_N == 0:
                    _, buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
                    frame_base64 = base64.b64encode(buffer).decode('utf-8')

                    if self.loop is not None:
                        asyncio.run_coroutine_threadsafe(manager.broadcast({
                        "type": "update",
                        "stats": self.stats.model_dump(),
                        "frame": f"data:image/jpeg;base64,{frame_base64}"
                    }), self.loop)
                
                frame_count += 1
                cv2.waitKey(1)
        finally:
            cap.release()

analyzer = TrafficAnalyzer()

@app.get("/")
async def root():
    return {"status": "ok", "message": "Civic Sense AI Traffic API"}

@app.get("/api/stats")
async def get_stats():
    return analyzer.stats

@app.post("/api/analyze/start")
async def start_analysis(source_type: str = Form("webcam"), file: Optional[UploadFile] = File(None)):
    video_path = None
    
    if source_type == "video" and file:
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_location = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_location, "wb") as f:
            content = await file.read()
            f.write(content)
        
        video_path = file_location
    
    analyzer.reset_stats()
    analyzer.start(source=video_path, source_type=source_type)
    return {"status": "started", "source": source_type}

@app.post("/api/analyze/stop")
async def stop_analysis():
    analyzer.stop()
    return {"status": "stopped"}

@app.websocket("/ws/traffic")
async def websocket_traffic(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json({"type": "snapshot", "stats": analyzer.stats.model_dump()})
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
