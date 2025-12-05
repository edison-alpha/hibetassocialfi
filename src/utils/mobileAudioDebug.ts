/**
 * Mobile Audio Debug Helper
 * Helps diagnose audio playback issues on mobile devices
 */

export const logMobileAudioInfo = () => {
  const info = {
    userAgent: navigator.userAgent,
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    
    // Audio support
    audioSupport: {
      mp3: document.createElement('audio').canPlayType('audio/mpeg'),
      wav: document.createElement('audio').canPlayType('audio/wav'),
      ogg: document.createElement('audio').canPlayType('audio/ogg'),
    },
    
    // Web Audio API support
    webAudioAPI: !!(window.AudioContext || (window as any).webkitAudioContext),
    
    // Screen info
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      orientation: window.screen.orientation?.type || 'unknown',
    },
    
    // Touch support
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Network info (if available)
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt,
    } : 'not available',
  };
  
  console.log('📱 Mobile Audio Debug Info:', info);
  return info;
};

export const testAudioPlayback = async (audioUrl: string) => {
  console.log('🧪 Testing audio playback for:', audioUrl);
  
  const audio = new Audio();
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
  audio.preload = 'auto';
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Audio load timeout after 10 seconds'));
    }, 10000);
    
    audio.addEventListener('loadeddata', () => {
      console.log('✅ Audio loaded successfully');
      console.log('Audio info:', {
        duration: audio.duration,
        readyState: audio.readyState,
        networkState: audio.networkState,
      });
      clearTimeout(timeout);
      resolve(true);
    });
    
    audio.addEventListener('error', (e) => {
      console.error('❌ Audio load error:', e);
      console.error('Error details:', {
        code: audio.error?.code,
        message: audio.error?.message,
      });
      clearTimeout(timeout);
      reject(audio.error);
    });
    
    audio.src = audioUrl;
    audio.load();
  });
};

// Call this on app load to log mobile info
if (typeof window !== 'undefined') {
  // Only log in development
  if (import.meta.env.DEV) {
    logMobileAudioInfo();
  }
}
