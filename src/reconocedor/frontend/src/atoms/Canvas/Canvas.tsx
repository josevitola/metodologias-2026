import React, { useRef, useEffect } from 'react';

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
  animation?: boolean;
}

const Canvas = ({ draw, animation, ...rest }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef =
    useRef<(ctx: CanvasRenderingContext2D, frameCount: number) => void>(draw);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d') as CanvasRenderingContext2D;

    let animationFrameId: number;

    const render = () => {
      if (animation) {
        drawRef.current(context, frameRef.current++);
        animationFrameId = globalThis.requestAnimationFrame(render);
      }
    };

    animationFrameId = globalThis.requestAnimationFrame(render);
    return () => {
      globalThis.cancelAnimationFrame(animationFrameId);
    };
  }, [animation]);

  return <canvas ref={canvasRef} {...rest} />;
};

export default Canvas;
