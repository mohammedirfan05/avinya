"""First working traffic analysis script.

Reads a video file, webcam, or RTSP stream, runs YOLOv8 detection with ByteTrack
tracking, and counts vehicle tracks when they cross a horizontal line.
"""

from __future__ import annotations

import argparse
from collections import defaultdict
from dataclasses import dataclass
from math import hypot
from pathlib import Path
from typing import Dict, Optional

import cv2
from ultralytics import YOLO


VEHICLE_CLASS_IDS = [2, 3, 5, 7]
VEHICLE_CLASS_NAMES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}
DEFAULT_VIDEO_SOURCE = r"demo_videos/traffic_video.mp4"


@dataclass
class TrackState:
    box: tuple[float, float, float, float]
    center_y: float
    class_id: int
    last_seen_frame: int


def build_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Real-time vehicle detection, tracking, and counting.")
    parser.add_argument(
        "source",
        nargs="?",
        default=DEFAULT_VIDEO_SOURCE,
        help="Video file path, webcam index, or RTSP stream URL. Defaults to C:\\avinya3\\traffic_video.mp4.",
    )
    parser.add_argument("--model", default="yolo26n.pt", help="Ultralytics YOLO model path or name")
    parser.add_argument("--output", default="", help="Optional output video path. Leave empty to only show overlays live.")
    parser.add_argument("--conf", type=float, default=0.3, help="Detection confidence threshold")
    parser.add_argument("--imgsz", type=int, default=640, help="Inference image size")
    parser.add_argument("--line-position", type=float, default=0.5, help="Count line position as a fraction of the active axis")
    parser.add_argument("--count-axis", choices=("auto", "horizontal", "vertical"), default="auto", help="Count across a horizontal or vertical line. Auto chooses based on motion.")
    parser.add_argument("--display-max-width", type=int, default=1280, help="Maximum width of the live preview window")
    parser.add_argument("--display-max-height", type=int, default=720, help="Maximum height of the live preview window")
    parser.add_argument("--show", action="store_true", default=True, help="Show live annotated frames in a window")
    return parser.parse_args()


def ensure_parent_dir(path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)


def resolve_input_source(raw_source: str) -> str | int:
    source_path = Path(raw_source)
    if raw_source.isdigit():
        return int(raw_source)
    if source_path.exists():
        return str(source_path)
    if raw_source == DEFAULT_VIDEO_SOURCE:
        raise FileNotFoundError(
            f"Default video file '{DEFAULT_VIDEO_SOURCE}' was not found. Check that the path exists or pass a different source."
        )
    return raw_source


def draw_info(
    frame,
    total_count: int,
    direction_counts: Dict[str, int],
    class_counts: Dict[str, int],
    count_axis: str,
    line_position: int,
) -> None:
    if count_axis == "vertical":
        cv2.line(frame, (line_position, 0), (line_position, frame.shape[0]), (0, 255, 255), 2)
        direction_label_a = "Left"
        direction_label_b = "Right"
        count_a = direction_counts[direction_label_a.lower()]
        count_b = direction_counts[direction_label_b.lower()]
    else:
        cv2.line(frame, (0, line_position), (frame.shape[1], line_position), (0, 255, 255), 2)
        direction_label_a = "Up"
        direction_label_b = "Down"
        count_a = direction_counts[direction_label_a.lower()]
        count_b = direction_counts[direction_label_b.lower()]

    cv2.rectangle(frame, (10, 10), (340, 150), (0, 0, 0), -1)
    cv2.putText(frame, f"Total Count: {total_count}", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, f"{direction_label_a}: {count_a}  {direction_label_b}: {count_b}", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    cv2.putText(frame, f"Cars: {class_counts['car']}  Bikes: {class_counts['motorcycle']}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    cv2.putText(frame, f"Buses: {class_counts['bus']}  Trucks: {class_counts['truck']}", (20, 115), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)


def box_to_tuple(box) -> tuple[float, float, float, float]:
    x1, y1, x2, y2 = box.tolist()
    return float(x1), float(y1), float(x2), float(y2)


def box_center(box: tuple[float, float, float, float]) -> tuple[float, float]:
    x1, y1, x2, y2 = box
    return (x1 + x2) / 2.0, (y1 + y2) / 2.0


def box_iou(box_a: tuple[float, float, float, float], box_b: tuple[float, float, float, float]) -> float:
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b

    inter_x1 = max(ax1, bx1)
    inter_y1 = max(ay1, by1)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)

    inter_width = max(0.0, inter_x2 - inter_x1)
    inter_height = max(0.0, inter_y2 - inter_y1)
    inter_area = inter_width * inter_height

    if inter_area == 0.0:
        return 0.0

    area_a = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
    area_b = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
    denominator = area_a + area_b - inter_area
    if denominator <= 0.0:
        return 0.0
    return inter_area / denominator


def match_track_id(
    detection_box: tuple[float, float, float, float],
    class_id: int,
    active_tracks: Dict[int, TrackState],
    matched_track_ids: set[int],
    frame_index: int,
) -> int:
    detection_center_x, detection_center_y = box_center(detection_box)
    detection_width = detection_box[2] - detection_box[0]
    detection_height = detection_box[3] - detection_box[1]
    max_distance = max(40.0, max(detection_width, detection_height) * 1.5)

    best_track_id = -1
    best_score = float("inf")
    for track_id, track in active_tracks.items():
        if track_id in matched_track_ids:
            continue
        if frame_index - track.last_seen_frame > 10:
            continue
        if track.class_id != class_id:
            continue

        track_center_x, track_center_y = box_center(track.box)
        distance = hypot(detection_center_x - track_center_x, detection_center_y - track_center_y)
        overlap = box_iou(detection_box, track.box)
        if distance <= max_distance or overlap >= 0.05:
            score = distance - (overlap * 100.0)
            if score < best_score:
                best_score = score
                best_track_id = track_id

    return best_track_id


def fit_frame_to_bounds(frame, max_width: int, max_height: int):
    height, width = frame.shape[:2]
    if width <= max_width and height <= max_height:
        return frame

    scale = min(max_width / width, max_height / height)
    new_width = max(1, int(width * scale))
    new_height = max(1, int(height * scale))
    return cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)


def main() -> None:
    args = build_args()
    source = resolve_input_source(args.source)

    model = YOLO(args.model)

    total_count = 0
    direction_counts = defaultdict(int)
    class_counts = defaultdict(int)
    active_tracks: Dict[int, TrackState] = {}
    counted_ids = set()
    next_track_id = 1
    motion_dx = 0.0
    motion_dy = 0.0
    count_axis = args.count_axis if args.count_axis != "auto" else None
    video_writer: Optional[cv2.VideoWriter] = None

    results = model.predict(
        source=source,
        stream=True,
        conf=args.conf,
        imgsz=args.imgsz,
        classes=VEHICLE_CLASS_IDS,
        verbose=False,
    )

    for frame_index, result in enumerate(results):
        frame = result.orig_img.copy()
        frame_height, frame_width = frame.shape[:2]
        matched_track_ids: set[int] = set()
        axis_line_position = int((frame_width if count_axis == "vertical" else frame_height) * args.line_position)

        boxes = result.boxes
        if boxes is not None and len(boxes) > 0:
            xyxy = boxes.xyxy.cpu().numpy()
            cls_ids = boxes.cls.cpu().numpy().astype(int)

            for box, class_id in zip(xyxy, cls_ids):
                detection_box = box_to_tuple(box)
                track_id = match_track_id(detection_box, class_id, active_tracks, matched_track_ids, frame_index)
                if track_id == -1:
                    track_id = next_track_id
                    next_track_id += 1

                matched_track_ids.add(track_id)
                previous_track = active_tracks.get(track_id)
                previous_x = None if previous_track is None else box_center(previous_track.box)[0]
                previous_y = None if previous_track is None else previous_track.center_y
                center_x, center_y = box_center(detection_box)

                if previous_track is not None:
                    motion_dx += abs(center_x - previous_x)
                    motion_dy += abs(center_y - previous_y)

                active_tracks[track_id] = TrackState(
                    box=detection_box,
                    center_y=center_y,
                    class_id=class_id,
                    last_seen_frame=frame_index,
                )

                if count_axis is None:
                    continue

                if track_id in counted_ids or previous_track is None:
                    continue

                if count_axis == "vertical":
                    crossed_line = (previous_x < axis_line_position <= center_x) or (previous_x > axis_line_position >= center_x)
                    direction = "right" if center_x > previous_x else "left"
                else:
                    crossed_line = (previous_y < axis_line_position <= center_y) or (previous_y > axis_line_position >= center_y)
                    direction = "down" if center_y > previous_y else "up"

                if crossed_line:
                    counted_ids.add(track_id)
                    total_count += 1
                    direction_counts[direction] += 1
                    class_name = VEHICLE_CLASS_NAMES.get(class_id, "vehicle")
                    class_counts[class_name] += 1

        if count_axis is None and frame_index >= 3:
            count_axis = "vertical" if motion_dx >= motion_dy else "horizontal"

        stale_track_ids = [track_id for track_id, track in active_tracks.items() if frame_index - track.last_seen_frame > 15]
        for track_id in stale_track_ids:
            active_tracks.pop(track_id, None)

        annotated = result.plot()
        for track_id in matched_track_ids:
            track = active_tracks.get(track_id)
            if track is None:
                continue
            x1, y1, x2, y2 = track.box
            cv2.putText(
                annotated,
                f"ID {track_id}",
                (int(x1), max(0, int(y1) - 8)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2,
            )

        rendered_axis = count_axis if count_axis is not None else "vertical"
        draw_info(annotated, total_count, direction_counts, class_counts, rendered_axis, axis_line_position)

        if args.output and video_writer is None:
            ensure_parent_dir(args.output)
            height, width = annotated.shape[:2]
            video_writer = cv2.VideoWriter(
                args.output,
                cv2.VideoWriter_fourcc(*"mp4v"),
                25.0,
                (width, height),
            )

        if video_writer is not None:
            video_writer.write(annotated)

        if args.show:
            preview = fit_frame_to_bounds(annotated, args.display_max_width, args.display_max_height)
            cv2.imshow("Traffic Analysis", preview)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    if video_writer is not None:
        video_writer.release()

    if args.show:
        cv2.destroyAllWindows()

    print("Processing complete.")
    print(f"Total count: {total_count}")
    print(f"Direction counts: {dict(direction_counts)}")
    print(f"Class counts: {dict(class_counts)}")


if __name__ == "__main__":
    main()