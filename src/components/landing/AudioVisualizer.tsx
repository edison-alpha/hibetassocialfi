import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

export default function AudioVisualizer({ audioRef, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const currentHeightsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      
      // Check if source already exists to avoid duplicate connections
      if (!audioRef.current.dataset.connected) {
        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        audioRef.current.dataset.connected = 'true';
      }
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      currentHeightsRef.current = new Array(bufferLength).fill(0);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        // Don't disconnect or close on cleanup to avoid issues
      };
    } catch (error) {
      console.error('AudioVisualizer error:', error);
    }
  }, [audioRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !analyserRef.current || !dataArrayRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = analyser.frequencyBinCount;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      // Clear with transparency to show gradient background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Responsive bar width - lebih kecil di desktop
      const isDesktop = window.innerWidth >= 1024;
      const barWidth = isDesktop 
        ? (canvas.width / bufferLength) * 1.5  // Lebih kecil di desktop
        : (canvas.width / bufferLength) * 2.5; // Normal di mobile
      let x = 0;
      
      if (isPlaying) {
        // @ts-ignore - TypeScript issue with Uint8Array types
        analyser.getByteFrequencyData(dataArray);
        
        for (let i = 0; i < bufferLength; i++) {
          const targetHeight = ((dataArray[i] || 0) / 255) * canvas.height * 0.8;
          currentHeightsRef.current[i] = targetHeight;
          
          // Gradient from lime to white
          const gradient = ctx.createLinearGradient(0, canvas.height - targetHeight, 0, canvas.height);
          gradient.addColorStop(0, '#d5fd4c');
          gradient.addColorStop(1, 'rgba(213, 253, 76, 0.3)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - targetHeight, barWidth, targetHeight);
          
          x += barWidth + 1;
        }
      } else {
        // Animasi turun saat pause
        let allZero = true;
        for (let i = 0; i < bufferLength; i++) {
          if (currentHeightsRef.current[i] > 0) {
            currentHeightsRef.current[i] = Math.max(0, currentHeightsRef.current[i] - 8);
            allZero = false;
          }
          
          const barHeight = currentHeightsRef.current[i];
          
          if (barHeight > 0) {
            // Gradient from lime to white
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, '#d5fd4c');
            gradient.addColorStop(1, 'rgba(213, 253, 76, 0.3)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          }
          
          x += barWidth + 1;
        }
        
        // Stop animation when all bars are at 0
        if (allZero && animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Background matching page gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#180a1f] via-[#0c0112] to-[#180a1f]" />
      
      {/* Visualizer canvas */}
      <canvas
        ref={canvasRef}
        width={1920}
        height={600}
        className="absolute inset-0 w-full h-full opacity-40"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
