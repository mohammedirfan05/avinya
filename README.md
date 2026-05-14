# Traffic Analyzer

A Python script for real-time vehicle detection, tracking, and counting using YOLOv8 and ByteTrack.

## Description

This script reads a video file, webcam, or RTSP stream, performs object detection using YOLOv8, tracks vehicles with ByteTrack, and counts vehicles as they cross a specified horizontal line.

## Features

- Real-time vehicle detection and tracking
- Supports video files, webcam, and RTSP streams
- Counts vehicles crossing a configurable line
- Outputs overlay with detection boxes and counts

## Installation

1. Clone or download the repository.
2. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Download the YOLOv8 model (yolov8n.pt) if not present.

## Usage

Run the script with a video source:

```bash
python traffic_analyzer.py path/to/video.mp4
```

Or use webcam:

```bash
python traffic_analyzer.py 0
```

For RTSP stream:

```bash
python traffic_analyzer.py rtsp://your-stream-url
```

### Arguments

- `source`: Video file path, webcam index, or RTSP URL (default: traffic_video2.mp4)
- `--model`: YOLO model path (default: yolov8n.pt)
- `--output`: Output video path (optional)
- `--conf`: Detection confidence threshold (default: 0.3)
- `--imgsz`: Inference image size (default: 640)
- `--line-position`: Count line position as fraction of frame height (default: 0.5)

## Requirements

- Python 3.8+
- ultralytics
- opencv-python
- numpy

## License

[Add license if applicable]