import { useEffect, useRef } from 'react';

export const WaveForm = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 100;
    let animationId: number;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        const height = Math.sin(time * 0.002 + i * 0.1) * 50 + 60;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;
        
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#d5fd4c');
        gradient.addColorStop(1, '#ffffff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, height);
      }
      
      animationId = requestAnimationFrame(draw);
    };

    draw(0);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={1260} 
      height={126}
      className="w-full h-auto"
    />
  );
};
