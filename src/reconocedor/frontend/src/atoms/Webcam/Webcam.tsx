import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createCanvasFromMedia,
  detectAllFaces,
  draw,
  FaceDetection,
  matchDimensions,
  nets,
  resizeResults,
  TinyFaceDetectorOptions,
  WithFaceExpressions,
  WithFaceLandmarks,
} from 'face-api.js';
import { StyledVideo, StyledWebcamContainer } from './Webcam.styles';
import { getCenterOfDetectionBox } from '@/utils/getCenterOfDetectionBox';
import { Point } from '@/models';

export type FaceDetectionHandler = (
  detection: WithFaceExpressions<WithFaceLandmarks<{ detection: FaceDetection }>> | undefined,
) => void;

interface WebcamProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  width: number;
  height: number;
  onFaceDetection?: FaceDetectionHandler;
}

export const Webcam = ({ width, height, onFaceDetection }: WebcamProps) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Promise.all([
      nets.tinyFaceDetector.loadFromUri('/models'),
      nets.faceLandmark68Net.loadFromUri('/models'),
      nets.faceRecognitionNet.loadFromUri('/models'),
      nets.faceExpressionNet.loadFromUri('/models'),
    ])
      .catch((error) => {
        console.error('Error loading models:', error);
      })
      .then(() => {
        return navigator.mediaDevices.getUserMedia({ video: { facingMode: '' } });
      })
      .then((stream) => {
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          setIsReady(true);
        }
      })
      .catch((error) => {
        console.error('Error accessing webcam:', error);
      });
  }, []);

  const handlePlay = useCallback(() => {
    if (!isReady || !webcamRef.current) return;

    const canvasObject = createCanvasFromMedia(webcamRef.current, { width, height });
    containerRef.current?.appendChild(canvasObject);

    const displaySize = { width: webcamRef.current.width, height: webcamRef.current.height };

    matchDimensions(canvasObject, displaySize);

    setInterval(async () => {
      if (webcamRef.current) {
        const detections = await detectAllFaces(webcamRef.current, new TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const ctx = canvasObject.getContext('2d') as CanvasRenderingContext2D;

        ctx.clearRect(0, 0, width, height);

        if (detections.length > 0) {
          const resizedDetections = resizeResults(detections, { width, height });
          const point = getCenterOfDetectionBox(resizedDetections[0].detection);
          point.draw(ctx, new Point(0, 0));

          draw.drawDetections(canvasObject, resizedDetections);

          onFaceDetection?.(resizedDetections[0]);
        }

        onFaceDetection?.(undefined);
      }
    }, 100);
  }, [isReady]);

  return (
    <StyledWebcamContainer ref={containerRef}>
      <StyledVideo
        width={width}
        height={height}
        ref={webcamRef}
        autoPlay
        muted
        onPlay={handlePlay}
      />
    </StyledWebcamContainer>
  );
};
