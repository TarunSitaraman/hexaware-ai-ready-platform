import { useEffect, useState, useRef } from "react";

export function usePipelineWs(runId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    if (!runId) return;

    const connect = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
      const ws = new WebSocket(`${wsUrl}/api/v1/pipeline/ws`);
      
      ws.onopen = () => {
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pipeline_update" && data.run_id === runId) {
            // Trigger a re-fetch in the UI by updating this counter
            setUpdateCount((c) => c + 1);
          }
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      
      wsRef.current = ws;
    };
    
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [runId]);
  
  return { isConnected, updateCount };
}
