'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { renderAvatar } from '@/utils/canvasUtils';

interface AvatarCanvasProps {
  size?: number;
}

export default function AvatarCanvas({ size = 400 }: AvatarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    image,
    shape,
    zoom,
    offsetX,
    offsetY,
    selectedTemplate,
    setOffset,
    setZoom,
    setCanvasSize,
    setCanvasRef,
  } = useEditorStore();
  
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    setCanvasSize(size);
  }, [size, setCanvasSize]);
  
  useEffect(() => {
    if (canvasRef.current) {
      setCanvasRef(canvasRef.current);
    }
    return () => {
      setCanvasRef(null);
    };
  }, [setCanvasRef]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (!useEditorStore.getState().image) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const currentZoom = useEditorStore.getState().zoom;
      setZoom(currentZoom + delta);
    };
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [setZoom]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (image) {
      renderAvatar(ctx, {
        image,
        shape,
        zoom,
        offsetX,
        offsetY,
        canvasSize: size,
        template: selectedTemplate,
      });
    } else {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    }
  }, [image, shape, zoom, offsetX, offsetY, selectedTemplate, size]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!image) return;
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, [image]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - lastPosition.current.x;
    const dy = e.clientY - lastPosition.current.y;
    
    setOffset(offsetX + dx, offsetY + dy);
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, [offsetX, offsetY, setOffset]);
  
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={`cursor-${image ? 'grab' : 'default'} rounded-lg shadow-2xl ${
          shape === 'circle' ? 'rounded-full' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
