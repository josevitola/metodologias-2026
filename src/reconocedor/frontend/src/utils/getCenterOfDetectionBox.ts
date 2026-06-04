import { Point } from '@/models';

/** Box shape from face-api detections; kept structural so callers need not load face-api. */
export const getCenterOfDetectionBox = (
  detection: { box: { x: number; y: number; width: number; height: number } } | undefined,
) => {
  if (!detection) {
    return new Point(-1, -1);
  }

  const { x, y, width, height } = detection.box;
  return new Point(x + width / 2, y + height / 2);
};
