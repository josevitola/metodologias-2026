import { useCallback, useEffect, useRef, useState } from 'react';

export type FacePrediction = {
  bbox: [number, number, number, number];
  predicted_class: number | null;
  confidence: number | null;
  scores: number[];
};

export type PredictionMessage = {
  type: 'prediction';
  faces_detected: number;
  predictions: FacePrediction[];
};

export type ReadyMessage = {
  type: 'ready';
  message: string;
  config?: Record<string, unknown>;
};

export type InfoMessage = {
  type: 'info' | 'pong';
  message?: string;
};

export type ErrorMessage = {
  type: 'error';
  message: string;
};

export type WsServerMessage = PredictionMessage | ReadyMessage | InfoMessage | ErrorMessage;

export type UseFaceWebSocketOptions = {
  wsUrl: string;
  intervalMs?: number;
  enabled?: boolean;
  width?: number;
  height?: number;
  imageType?: 'image/jpeg' | 'image/png' | 'image/webp';
  imageQuality?: number;
  videoConstraints?: MediaTrackConstraints;
  autoStartSocket?: boolean;
  autoStartCamera?: boolean;
};

export type UseFaceWebSocketReturn = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stream: MediaStream | null;
  socket: WebSocket | null;
  isCameraReady: boolean;
  isSocketOpen: boolean;
  isStreaming: boolean;
  error: string | null;
  faces: FacePrediction[];
  lastMessage: WsServerMessage | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  startStreaming: () => void;
  stopStreaming: () => void;
  sendFrame: () => Promise<void>;
};

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo convertir el frame a Blob'));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export function useFaceWebSocket(options: UseFaceWebSocketOptions): UseFaceWebSocketReturn {
  const {
    wsUrl,
    intervalMs = 250,
    enabled = true,
    width = 640,
    height = 480,
    imageType = 'image/jpeg',
    imageQuality = 0.8,
    videoConstraints,
    autoStartSocket = true,
    autoStartCamera = true,
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<number | null>(null);
  const sendingRef = useRef(false);
  const abandonedRef = useRef(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [socketState, setSocketState] = useState<WebSocket | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSocketOpen, setIsSocketOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WsServerMessage | null>(null);
  const [faces, setFaces] = useState<FacePrediction[]>([]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints ?? {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: 'user',
        },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) {
        throw new Error('El ref del video no está montado');
      }

      video.srcObject = mediaStream;
      video.muted = true;
      video.playsInline = true;

      // Play explicitly — ignore interrupted errors that happen when the
      // srcObject assignment triggers a new load at the same time.
      try {
        await video.play();
      } catch {
        // The browser has already started playback from the srcObject assign.
      }

      setStream(mediaStream);
      setIsCameraReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo abrir la cámara';
      setError(message);
      setIsCameraReady(false);
      throw err;
    }
  }, [height, videoConstraints, width]);

  const stopCamera = useCallback(() => {
    setIsCameraReady(false);
    setStream((current) => {
      current?.getTracks().forEach((track) => track.stop());
      return null;
    });

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    abandonedRef.current = false;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (abandonedRef.current) {
        ws.close();
        return;
      }
      setIsSocketOpen(true);
      setError(null);
      ws.send(
        JSON.stringify({
          client: 'react-hook',
          format: imageType,
          width,
          height,
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsServerMessage;
        setLastMessage(data);

        if (data.type === 'prediction') {
          setFaces(data.predictions);
        }

        if (data.type === 'error') {
          setError(data.message);
        }
      } catch {
        setError('No se pudo parsear el mensaje del WebSocket');
      }
    };

    ws.onerror = () => {
      setError('Error en la conexión WebSocket');
    };

    ws.onclose = () => {
      // Only clear state if this WebSocket is still the current one.
      // In React Strict Mode the effect is mounted twice, and the old
      // WebSocket's onclose can fire asynchronously after a new
      // WebSocket has already been assigned to socketRef.current,
      // silently nullifying the ref and causing the UI to think the
      // socket is not connected.
      if (socketRef.current !== ws) {
        return;
      }
      setIsSocketOpen(false);
      setIsStreaming(false);
      socketRef.current = null;
      setSocketState(null);
    };

    socketRef.current = ws;
    setSocketState(ws);
  }, [height, imageType, width, wsUrl]);

  const disconnectSocket = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsStreaming(false);

    if (socketRef.current) {
      abandonedRef.current = true;
      socketRef.current.close();
      socketRef.current = null;
    }

    setSocketState(null);
    setIsSocketOpen(false);
  }, []);

  const sendFrame = useCallback(async () => {
    const ws = socketRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (!video || !canvas) return;
    if (!video.videoWidth || !video.videoHeight) return;
    if (sendingRef.current) return;

    sendingRef.current = true;

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas');
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await canvasToBlob(canvas, imageType, imageQuality);
      const buffer = await blob.arrayBuffer();

      ws.send(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo enviar el frame';
      setError(message);
    } finally {
      sendingRef.current = false;
    }
  }, [imageQuality, imageType]);

  const startStreaming = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError('El WebSocket no está conectado');
      return;
    }

    if (!isCameraReady) {
      setError('La cámara aún no está lista');
      return;
    }

    if (intervalRef.current) return;

    setIsStreaming(true);

    intervalRef.current = window.setInterval(() => {
      void sendFrame();
    }, intervalMs);
  }, [intervalMs, isCameraReady, sendFrame]);

  const stopStreaming = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (autoStartCamera) {
      void startCamera();
    }

    if (autoStartSocket) {
      connectSocket();
    }

    return () => {
      stopStreaming();
      disconnectSocket();
      stopCamera();
    };
  }, [
    autoStartCamera,
    autoStartSocket,
    connectSocket,
    disconnectSocket,
    enabled,
    startCamera,
    stopCamera,
    stopStreaming,
  ]);

  return {
    videoRef,
    canvasRef,
    stream,
    socket: socketState,
    isCameraReady,
    isSocketOpen,
    isStreaming,
    error,
    faces,
    lastMessage,
    startCamera,
    stopCamera,
    connectSocket,
    disconnectSocket,
    startStreaming,
    stopStreaming,
    sendFrame,
  };
}
