const API_BASE = 'http://localhost:8000';

export interface TrafficStats {
  total_count: number;
  direction_counts: Record<string, number>;
  class_counts: Record<string, number>;
}

export const api = {
  getStats: async (): Promise<TrafficStats> => {
    const response = await fetch(`${API_BASE}/api/stats`);
    return response.json();
  },
  startAnalysis: async (sourceType: 'webcam' | 'video', file?: File): Promise<{ status: string; source: string }> => {
    const formData = new FormData();
    formData.append('source_type', sourceType);
    if (sourceType === 'video' && file) {
      formData.append('file', file);
    }
    
    const response = await fetch(`${API_BASE}/api/analyze/start`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },
  stopAnalysis: async (): Promise<{ status: string }> => {
    const response = await fetch(`${API_BASE}/api/analyze/stop`, {
      method: 'POST',
    });
    return response.json();
  },
  connectWebSocket: (onMessage: (data: any) => void) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/traffic`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('WebSocket parse error:', e);
      }
    };
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    return ws;
  },
};
