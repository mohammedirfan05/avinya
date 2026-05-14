import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  Webcam
} from 'lucide-react';
import { api, type TrafficStats } from '../services/api';

const TrafficMonitoring = () => {
  const [sourceType, setSourceType] = useState<'webcam' | 'video'>('webcam');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState<TrafficStats>({
    total_count: 0,
    direction_counts: {},
    class_counts: {}
  });
  const [frame, setFrame] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    try {
      setUploading(true);
      await api.startAnalysis(sourceType, selectedFile || undefined);
      setIsAnalyzing(true);
      setUploading(false);
      
      wsRef.current = api.connectWebSocket((data) => {
        if (data.type === 'update') {
          setStats(data.stats);
          setFrame(data.frame);
        }
      });
    } catch (e) {
      console.error('Failed to start analysis:', e);
      setUploading(false);
    }
  };

  const stopAnalysis = async () => {
    try {
      await api.stopAnalysis();
      setIsAnalyzing(false);
      setFrame(null);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } catch (e) {
      console.error('Failed to stop analysis:', e);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-1">Traffic Intelligence</h2>
          <h1 className="text-3xl font-bold tracking-tight">Real-time Vehicle Detection</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAnalyzing ? (
            <button 
              onClick={stopAnalysis}
              className="px-6 py-3 bg-critical-red/20 text-critical-red border border-critical-red/50 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-critical-red/30 transition-all"
            >
              <Square size={18} />
              STOP ANALYSIS
            </button>
          ) : (
            <button 
              onClick={startAnalysis}
              disabled={sourceType === 'video' && !selectedFile}
              className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={18} />
              {uploading ? 'UPLOADING...' : 'START ANALYSIS'}
            </button>
          )}
        </div>
      </div>

      {/* Source Toggle */}
      <div className="glass p-6 rounded-3xl border-white/5">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400">Source:</span>
            <div className="flex bg-white/5 rounded-2xl p-1">
              <button
                onClick={() => setSourceType('webcam')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  sourceType === 'webcam' 
                    ? 'bg-primary text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Webcam size={16} />
                Webcam
              </button>
              <button
                onClick={() => setSourceType('video')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  sourceType === 'video' 
                    ? 'bg-primary text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload size={16} />
                Upload Video
              </button>
            </div>
          </div>
          
          {sourceType === 'video' && (
            <div className="flex items-center gap-4 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
              >
                <Upload size={16} />
                {selectedFile ? selectedFile.name : 'Select Video File'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-3xl border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Camera className="text-primary" size={20} />
                {sourceType === 'webcam' ? 'Camera Feed' : 'Video Feed'}
              </h3>
              <span className={cn(
                "text-xs font-bold px-3 py-1 rounded-full",
                isAnalyzing ? "bg-traffic-green/20 text-traffic-green" : "bg-slate-600/20 text-slate-400"
              )}>
                {isAnalyzing ? "LIVE" : "OFFLINE"}
              </span>
            </div>
            <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              {frame ? (
                <img src={frame} alt="Live Traffic" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-500">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">
                    {sourceType === 'webcam' 
                      ? 'Start analysis to view camera feed' 
                      : 'Select a video file and start analysis'}
                  </p>
                  <p className="text-sm">
                    {sourceType === 'video' && !selectedFile && 'Please select a video file first'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Detection Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl border-white/5">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Activity className="text-purple-glow" size={20} />
              Detection Statistics
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="text-primary" size={18} />
                  <span className="text-xs font-bold text-slate-400 uppercase">Cars</span>
                </div>
                <p className="text-2xl font-bold">{stats.class_counts.car || 0}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Bike className="text-warning-yellow" size={18} />
                  <span className="text-xs font-bold text-slate-400 uppercase">Motorcycles</span>
                </div>
                <p className="text-2xl font-bold">{stats.class_counts.motorcycle || 0}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Bus className="text-traffic-green" size={18} />
                  <span className="text-xs font-bold text-slate-400 uppercase">Buses</span>
                </div>
                <p className="text-2xl font-bold">{stats.class_counts.bus || 0}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="text-critical-red" size={18} />
                  <span className="text-xs font-bold text-slate-400 uppercase">Trucks</span>
                </div>
                <p className="text-2xl font-bold">{stats.class_counts.truck || 0}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total Vehicles</span>
                <span className="text-3xl font-bold text-primary">{stats.total_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default TrafficMonitoring;
