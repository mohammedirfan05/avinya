import React, { useState } from 'react';
import {
  Camera,
  Activity,
  Play,
  Square,
  Car,
  Truck,
  Bus,
  Bike,
  Upload,
  Webcam,
  Wifi,
  WifiOff,
  Clock3,
  Gauge,
  RefreshCcw,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useTrafficFeed } from '../hooks/useTrafficFeed';

const TrafficMonitoring = () => {
  const [sourceType, setSourceType] = useState<'webcam' | 'video'>('webcam');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { stats, frame, isConnected, isLoading, error, lastUpdateAt, refresh } = useTrafficFeed({
    mode: 'live',
    enabled: isAnalyzing,
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    try {
      setUploading(true);
      await api.startAnalysis(sourceType, selectedFile || undefined);
      await refresh();
      setIsAnalyzing(true);
    } catch (e) {
      console.error('Failed to start analysis:', e);
    } finally {
      setUploading(false);
    }
  };

  const stopAnalysis = async () => {
    try {
      await api.stopAnalysis();
      setIsAnalyzing(false);
      await refresh();
    } catch (e) {
      console.error('Failed to stop analysis:', e);
    }
  };

  const classCards = [
    { key: 'car', label: 'Cars', icon: Car },
    { key: 'motorcycle', label: 'Motorcycles', icon: Bike },
    { key: 'bus', label: 'Buses', icon: Bus },
    { key: 'truck', label: 'Trucks', icon: Truck },
  ] as const;

  const directionCards = [
    { key: 'left', label: 'Left', icon: ArrowLeftRight },
    { key: 'right', label: 'Right', icon: ArrowRight },
    { key: 'up', label: 'Up', icon: ArrowRight },
    { key: 'down', label: 'Down', icon: ArrowRight },
  ] as const;

  const liveMetricCards = [
    { label: 'Total Tracks', value: stats.total_count, icon: Activity },
    { label: 'FPS', value: stats.fps?.toFixed(1) ?? '0.0', icon: Gauge },
    { label: 'Frames Seen', value: stats.processed_frames ?? 0, icon: Clock3 },
    { label: 'Connections', value: stats.active_connections ?? 0, icon: Wifi },
  ] as const;

  const liveState = isAnalyzing ? (isConnected ? 'live' : isLoading ? 'connecting' : 'reconnecting') : 'idle';

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-1">Traffic Intelligence</h2>
          <h1 className="text-3xl font-semibold tracking-tight">Vehicle Detection</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAnalyzing ? (
            <button
              onClick={stopAnalysis}
              className="px-5 py-2.5 bg-white/15 text-white border border-white/20 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-white/25 transition-all"
            >
              <Square size={16} />
              Stop Live Feed
            </button>
          ) : (
            <button
              onClick={startAnalysis}
              disabled={sourceType === 'video' && !selectedFile}
              className="px-5 py-2.5 bg-primary text-black rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              {uploading ? 'Starting...' : 'Start Live Feed'}
            </button>
          )}
        </div>
      </div>

      <div className="glass p-5 rounded-xl border-white/5">
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-400">Source:</span>
            <div className="flex bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setSourceType('webcam')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                  sourceType === 'webcam' ? 'bg-primary text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Webcam size={14} />
                Webcam
              </button>
              <button
                onClick={() => setSourceType('video')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                  sourceType === 'video' ? 'bg-primary text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Upload size={14} />
                Upload Video
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-2',
                liveState === 'live'
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : liveState === 'connecting'
                    ? 'bg-amber-500/15 text-amber-300'
                    : liveState === 'reconnecting'
                      ? 'bg-rose-500/15 text-rose-300'
                      : 'bg-neutral-600/20 text-neutral-400',
              )}
            >
              {liveState === 'live' ? <Wifi size={12} /> : <WifiOff size={12} />}
              {liveState === 'live' ? 'Live' : liveState === 'connecting' ? 'Connecting' : liveState === 'reconnecting' ? 'Reconnecting' : 'Idle'}
            </span>
            <button
              onClick={() => void refresh()}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-neutral-300 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <RefreshCcw size={12} />
              Sync stats
            </button>
          </div>
        </div>

        {sourceType === 'video' && (
          <div className="mt-4 flex items-center gap-4 flex-1">
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
            >
              <Upload size={14} />
              {selectedFile ? selectedFile.name : 'Select Video'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {liveMetricCards.map((card) => (
          <div key={card.label} className="glass p-4 rounded-xl border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">{card.label}</span>
              <card.icon size={16} className="text-primary" />
            </div>
            <div className="text-2xl font-semibold tabular-nums text-white">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass p-5 rounded-xl border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium flex items-center gap-2">
                <Camera className="text-primary" size={18} />
                {sourceType === 'webcam' ? 'Camera Feed' : 'Video Feed'}
              </h3>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>{stats.source}</span>
                <span>Updated {lastUpdateAt ? new Date(lastUpdateAt).toLocaleTimeString() : 'just now'}</span>
              </div>
            </div>
            <div className="aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
              {frame ? (
                <img src={frame} alt="Live traffic analysis feed" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-neutral-500 px-6">
                  <Camera size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-base mb-1">
                    {isAnalyzing
                      ? 'Waiting for the first live frame'
                      : sourceType === 'webcam'
                        ? 'Start analysis to view camera feed'
                        : 'Select a video file and start analysis'}
                  </p>
                  <p className="text-sm text-neutral-600">{error ? error : 'Low-latency analysis updates will stream here.'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass p-5 rounded-xl border-white/5">
              <h3 className="text-base font-medium flex items-center gap-2 mb-5">
                <Activity className="text-accent-glow" size={18} />
                Vehicle Mix
              </h3>
              <div className="space-y-3">
                {classCards.map((card) => {
                  const value = stats.class_counts[card.key] || 0;
                  const maxValue = Math.max(...classCards.map((item) => stats.class_counts[item.key] || 0), 1);
                  const percentage = (value / maxValue) * 100;
                  return (
                    <div key={card.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-neutral-300">
                          <card.icon size={14} className="text-primary" />
                          {card.label}
                        </span>
                        <span className="font-medium tabular-nums">{value}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent-glow rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass p-5 rounded-xl border-white/5">
              <h3 className="text-base font-medium flex items-center gap-2 mb-5">
                <ArrowLeftRight className="text-accent-glow" size={18} />
                Movement Direction
              </h3>
              <div className="space-y-3">
                {directionCards.map((card) => {
                  const value = stats.direction_counts[card.key] || 0;
                  return (
                    <div key={card.key} className="flex items-center justify-between bg-white/5 px-3 py-2.5 rounded-lg">
                      <span className="flex items-center gap-2 text-sm text-neutral-300">
                        <card.icon size={14} className="text-primary" />
                        {card.label}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-5 rounded-xl border-white/5">
            <h3 className="text-base font-medium flex items-center gap-2 mb-5">
              <Gauge className="text-primary" size={18} />
              Performance
            </h3>
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <span>Running</span>
                <span className={stats.running ? 'text-emerald-300' : 'text-neutral-500'}>{stats.running ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <span>Backend FPS</span>
                <span className="tabular-nums">{stats.fps?.toFixed(1) ?? '0.0'}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <span>Connections</span>
                <span className="tabular-nums">{stats.active_connections ?? 0}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <span>Source</span>
                <span className="capitalize">{stats.source || sourceType}</span>
              </div>
            </div>
          </div>

          <div className="glass p-5 rounded-xl border-white/5">
            <h3 className="text-base font-medium flex items-center gap-2 mb-5">
              <Activity className="text-primary" size={18} />
              Live Summary
            </h3>
            <div className="space-y-3 text-sm text-neutral-300">
              <p>Live feed status updates are now streamed from the backend websocket.</p>
              <p className="text-neutral-500">This reduces polling overhead and keeps the feed synchronized with the latest analyzer state.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}

export default TrafficMonitoring;
