import { useFaceWebSocket } from '@/hooks';

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

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Face detection por WebSocket</h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '100%', borderRadius: 12, background: '#111' }}
      />

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
