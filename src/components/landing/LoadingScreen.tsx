import { useEffect, useState } from 'react';
import hibeatLogoOnly from '@/assets/logoo.png';
import somniaLogoOnly from '@/assets/somi.png';
import hibeatTextOnly from '@/assets/logoo text.png';
import somniaTextOnly from '@/assets/somi text.png';

export const LoadingScreen = () => {
  const [stage, setStage] = useState<'initial' | 'logos' | 'full'>('initial');

  useEffect(() => {
    // Stage 1: Show logos without text
    const timer1 = setTimeout(() => {
      setStage('logos');
      console.log('Stage 1: logos');
    }, 100);
    
    // Stage 2: Transition to full logos with text
    const timer2 = setTimeout(() => {
      setStage('full');
      console.log('Stage 2: full');
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#180a1f] via-[#0c0112] to-[#180a1f] flex items-center justify-center z-50 overflow-hidden px-4">
      {/* Container for both stages with responsive width */}
      <div className="relative flex items-center justify-center w-full max-w-[600px] sm:w-[600px]">
        {/* Hibeats Side */}
        <div className="flex items-center justify-end flex-1">
          {/* Hibeats Logo (always visible) */}
          <div 
            className={`transition-all duration-700 ${
              stage === 'logos' || stage === 'full' ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
          >
            <img 
              src={hibeatLogoOnly} 
              alt="Hibeats" 
              className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
            />
          </div>
          
          {/* Hibeats Text (slides in from right) */}
          <div 
            className={`transition-all duration-700 overflow-hidden ${
              stage === 'full' ? 'max-w-[120px] sm:max-w-[200px] opacity-100 ml-2 sm:ml-3' : 'max-w-0 opacity-0 ml-0'
            }`}
          >
            <img 
              src={hibeatTextOnly} 
              alt="Hibeats Text" 
              className="h-8 sm:h-14 w-auto object-contain"
            />
          </div>
        </div>

        {/* Divider (fades in with text) */}
        <div 
          className={`transition-all duration-700 ${
            stage === 'full' ? 'w-px h-10 sm:h-16 opacity-100 mx-4 sm:mx-8' : 'w-0 h-10 sm:h-16 opacity-0 mx-5 sm:mx-10'
          } bg-white/30 flex-shrink-0`}
        />

        {/* Somnia Side */}
        <div className="flex items-center justify-start flex-1">
          {/* Somnia Logo (always visible) */}
          <div 
            className={`transition-all duration-700 ${
              stage === 'logos' || stage === 'full' ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
          >
            <img 
              src={somniaLogoOnly} 
              alt="Somnia" 
              className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
            />
          </div>
          
          {/* Somnia Text (slides in from right) */}
          <div 
            className={`transition-all duration-700 overflow-hidden ${
              stage === 'full' ? 'max-w-[120px] sm:max-w-[200px] opacity-100 ml-1.5 sm:ml-2' : 'max-w-0 opacity-0 ml-0'
            }`}
          >
            <img 
              src={somniaTextOnly} 
              alt="Somnia Text" 
              className="h-6 sm:h-10 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
