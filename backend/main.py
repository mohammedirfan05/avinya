from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import asyncio
import threading
import cv2
import os
import uuid
from ultralytics import YOLO
from collections import defaultdict
import base64
import json
from queue import Queue

app = FastAPI(title="Civic Sense AI Traffic API")

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

    def start(self, source: Optional[str] = None):
        if self.running:
            return
        self.running = True
        self.video_source = source if source else 0
        self.model = YOLO("yolo26n.pt")
        self.thread = threading.Thread(target=self._process_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False

    def reset_stats(self):
        self.stats = TrafficStats()

    def _process_loop(self):
        class_counts = defaultdict(int)
        counted_track_ids = set()
        frame_count = 0
        PROCESS_EVERY_N_FRAMES = 3
        SEND_FRAME_EVERY_N = 2
        JPEG_QUALITY = 60
        
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
                        annotated_frame = results[0].plot()
                        
                        if results[0].boxes and results[0].boxes.id is not None:
                            track_ids = results[0].boxes.id.cpu().numpy().astype(int)
                            cls_ids = results[0].boxes.cls.cpu().numpy().astype(int)
                            
                            for track_id, class_id in zip(track_ids, cls_ids):
                                if track_id not in counted_track_ids:
                                    counted_track_ids.add(track_id)
                                    class_name = VEHICLE_CLASS_NAMES.get(class_id, "vehicle")
                                    class_counts[class_name] += 1
                
                self.stats.total_count = len(counted_track_ids)
                self.stats.class_counts = dict(class_counts)
                
                if frame_count % SEND_FRAME_EVERY_N == 0:
                    _, buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
                    frame_base64 = base64.b64encode(buffer).decode('utf-8')
                    
                    asyncio.run(manager.broadcast({
                        "type": "update",
                        "stats": self.stats.model_dump(),
                        "frame": f"data:image/jpeg;base64,{frame_base64}"
                    }))
                
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
    analyzer.start(source=video_path)
    return {"status": "started", "source": source_type}

@app.post("/api/analyze/stop")
async def stop_analysis():
    analyzer.stop()
    return {"status": "stopped"}

@app.websocket("/ws/traffic")
async def websocket_traffic(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
