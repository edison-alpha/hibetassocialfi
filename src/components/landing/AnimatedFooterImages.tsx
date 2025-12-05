import { useState, useEffect } from 'react';

// Import images
import frame42 from '../../assets/Property 1=Frame 42.png';
import frame43 from '../../assets/Property 1=Frame 43.png';
import frame44 from '../../assets/Property 1=Frame 44.png';
import frame45 from '../../assets/Property 1=Frame 45.png';
import frame46 from '../../assets/Property 1=Frame 46.png';

export const AnimatedFooterImages = () => {
  const animationImages = [frame43, frame44, frame45, frame46]; // Sequential order: 43, 44, 45, 46
  const [currentIndex, setCurrentIndex] = useState(-1); // Start at -1 to show frame42 first

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animationImages.length);
    }, 800); // Moderate speed 800ms interval

    return () => clearInterval(interval);
  }, []);

  // Show frame42 initially, then cycle through animation images
  const currentImage = currentIndex === -1 ? frame42 : animationImages[currentIndex];

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-6xl mx-auto">
        <img
          src={currentImage}
          alt="Animated Footer"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};
