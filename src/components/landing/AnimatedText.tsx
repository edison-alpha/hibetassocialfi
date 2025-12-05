import { useState, useEffect } from 'react';

const words = ['Mint', 'Share', 'Trade', 'Explore'];

export const AnimatedText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span 
      className={`inline-block bg-gradient-to-r from-[#d5fd4c] to-white bg-clip-text text-transparent transition-all duration-300 ${
        isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      {words[currentIndex]}
    </span>
  );
};
