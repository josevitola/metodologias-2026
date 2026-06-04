import { useCallback, useEffect, useRef } from 'react';
import { useFaceWebSocket } from '@/hooks';

function drawBboxes(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  faces: Array<{
    bbox: [number, number, number, number];
    predicted_class: number | null;
    confidence: number | null;
  }>,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const displayWidth = video.clientWidth;
  const displayHeight = video.clientHeight;
  const naturalWidth = video.videoWidth;
  const naturalHeight = video.videoHeight;

  // Keep canvas in sync with the displayed video size
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Scale factors from natural → displayed size
  const scaleX = displayWidth / (naturalWidth || 1);
  const scaleY = displayHeight / (naturalHeight || 1);

  for (const face of faces) {
    const [x, y, w, h] = face.bbox;

    const rx = x * scaleX;
    const ry = y * scaleY;
    const rw = w * scaleX;
    const rh = h * scaleY;

    // Draw bounding box
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.strokeRect(rx, ry, rw, rh);

    // Label
    const label =
      face.predicted_class !== null
        ? `class=${face.predicted_class} conf=${(face.confidence ?? 0).toFixed(3)}`
        : 'face';

    ctx.font = 'bold 14px monospace';
    const metrics = ctx.measureText(label);
    const labelHeight = 20;

    // Semi-transparent background for label
    ctx.fillStyle = 'rgba(0, 255, 136, 0.25)';
    ctx.fillRect(rx, ry - labelHeight, metrics.width + 8, labelHeight);

    ctx.fillStyle = '#00ff88';
    ctx.fillText(label, rx + 4, ry - 6);
  }
}

export function FaceWsDemo() {
  const {
    videoRef,
    canvasRef,
    faces,
    isCameraReady,
    isSocketOpen,
    isStreaming,
    error,
    startStreaming,
    stopStreaming,
    sendFrame,
  } = useFaceWebSocket({
    wsUrl: 'ws://localhost:8000/ws/predict',
    intervalMs: 300,
    enabled: true,
    autoStartCamera: true,
    autoStartSocket: true,
  });

  const overlayRef = useRef<HTMLCanvasElement>(null);

  const redraw = useCallback(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay) return;
    drawBboxes(overlay, video, faces);
  }, [faces, videoRef]);

  // Redraw whenever faces change
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Also redraw whenever the video element's display size changes (e.g. after layout)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new ResizeObserver(() => {
      redraw();
    });

    observer.observe(video);
    return () => observer.disconnect();
  }, [redraw, videoRef]);

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Face detection por WebSocket</h2>

      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', borderRadius: 12, background: '#111', display: 'block' }}
        />

        <canvas
          ref={overlayRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 12,
            pointerEvents: 'none',
          }}
        />
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={startStreaming} disabled={!isCameraReady || !isSocketOpen || isStreaming}>
          Iniciar stream
        </button>
        <button onClick={stopStreaming} disabled={!isStreaming}>
          Detener stream
        </button>
        <button onClick={() => void sendFrame()} disabled={!isCameraReady || !isSocketOpen}>
          Enviar frame
        </button>
      </div>

      <p>Cámara lista: {String(isCameraReady)}</p>
      <p>Socket abierto: {String(isSocketOpen)}</p>
      <p>Rostros detectados: {faces.length}</p>

      {faces.map((face, idx) => (
        <div key={idx}>
          bbox: [{face.bbox.join(', ')}], class: {String(face.predicted_class)}, conf:{' '}
          {face.confidence?.toFixed(3) ?? 'null'}
        </div>
      ))}

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}
