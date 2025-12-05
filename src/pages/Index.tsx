import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Pause, MapPin, Cloud, Timer, Sparkles, ArrowUpRight, ChevronDown } from 'lucide-react';

// Import components
import {
  AnimatedText,
  ReviewCarousel,
  AlbumGrid,
  EcosystemGrid,
  LoadingScreen,
  AnimatedFooterImages,
  InfiniteLogoScroll,
  AudioVisualizer
} from '../components/landing';

// Import logo and assets
import hibeatsLogo from '../assets/hibeats brand.svg';
import waveformImage from '../assets/waveform.png';
import geminiLogo from '../assets/Gemini logo.png';
import abstractImage from '../assets/abstract.png';
import abstract2Image from '../assets/abstract2.png';
import lineImage from '../assets/line.png';
import tinImage from '../assets/tin.png';
import tin2Image from '../assets/tin2.png';
import socialFiImage1 from '../assets/Property 1=image 21.png';
import socialFiImage2 from '../assets/Property 1=Frame 31.png';
import socialFiImage3 from '../assets/Property 1=Frame 30.png';

// Import ecosystem assets
import hibeatMusicImg from '../assets/hibeatMusic.jpg';
import musicChartImg from '../assets/musicChart.jpg';
import liveDiffuserImg from '../assets/sphre.png';
import channelImg from '../assets/channel.jpg';
import tuneAIImg from '../assets/tuneAI.jpg';
import aiPlaylistImg from '../assets/AIplaylist.jpg';

// Import social icons
import xIcon from '../assets/x.svg';
import spotifyIcon from '../assets/Spotify.svg';
import telegramIcon from '../assets/telegram.svg';
import igIcon from '../assets/ig.svg';
import dcIcon from '../assets/dc.svg';

// Import album covers
import shatteredGlowImg from '../assets/shatteredGlow.jpg';
import shatteredCurrentsImg from '../assets/shatteredCurrents.jpg';
import moonlitRendezvousImg from '../assets/moonlitRendezvous.jpg';

// Import audio file
import hibeatsAudio from '../assets/HiBeats Now Live.mp3';

// Import beta button image
import betaImage from '../assets/beta.png';

// Import albums for carousel
import album1Img from '../assets/album1.png';
import album2Img from '../assets/album2.png';
import album3Img from '../assets/album3.png';
import album4Img from '../assets/album4.png';
import album5Img from '../assets/album5.png';
import album6Img from '../assets/album6.png';
import album7Img from '../assets/album7.png';
import album8Img from '../assets/album8.jpg';
import album9Img from '../assets/album9.jpg';
import album10Img from '../assets/album10.jpg';
import album11Img from '../assets/album11.jpg';

// Asset URLs from Figma - Exact from design
const ASSETS = {
  logo: "https://www.figma.com/api/mcp/asset/2b50732a-3f7c-4a3d-bbb5-255f50b6b0d0",
  heroImage: "https://www.figma.com/api/mcp/asset/ac00e041-1191-4beb-814a-965a163b209b",
  geminiLogo: "https://www.figma.com/api/mcp/asset/1841a9a1-175d-4051-a0ca-f1509f417b28",
  geminiLogoSmall: "https://www.figma.com/api/mcp/asset/bc29782d-104c-465b-942c-bb5ef84abde7",
  aiAgent: "https://www.figma.com/api/mcp/asset/bf9e920d-767a-431f-a248-925d82d6e62d",
  decorativeWave: "https://www.figma.com/api/mcp/asset/72fe49e6-1d5d-4d27-ba9e-15fd0d8b9c00",
  waveformBg: "https://www.figma.com/api/mcp/asset/6cb3a8a6-1405-4f1b-a744-b819669da134",
  albums: [
    album1Img,
    album2Img,
    album3Img,
    album4Img,
    album5Img,
    album6Img,
    album7Img,
    album8Img,
    album9Img,
    album10Img,
    album11Img,
  ],
  albumCovers: {
    shatteredGlow: shatteredGlowImg,
    moonlitRendezvous: moonlitRendezvousImg,
    shatteredCurrents: shatteredCurrentsImg,
  },
  ecosystem: {
    hibeatMusic: hibeatMusicImg,
    musicChart: musicChartImg,
    liveDiffuser: liveDiffuserImg,
    channel: channelImg,
    tuneAI: tuneAIImg,
    aiPlaylist: aiPlaylistImg,
  },
  socialIcons: {
    twitter: xIcon,
    discord: dcIcon,
    telegram: telegramIcon,
    youtube: spotifyIcon,
    instagram: igIcon,
  },
};

export default function Landing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio(hibeatsAudio);
    audioRef.current.loop = true;

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleLaunchApp = () => {
    navigate('/feed');
  };

  const togglePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          // Resume AudioContext if suspended (browser autoplay policy)
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Audio playback error:', error);
        // Reset state if play fails
        setIsPlaying(false);
      }
    }
  };

  // SocialFi images rotation state
  const socialFiImages = [socialFiImage1, socialFiImage2, socialFiImage3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageFading, setIsImageFading] = useState(false);

  // Rotate SocialFi images every 4 seconds
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setIsImageFading(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % socialFiImages.length);
        setIsImageFading(false);
      }, 500); // Fade duration
    }, 4000); // Change every 4 seconds

    return () => clearInterval(imageInterval);
  }, []);

  // Scanning animation state
  const [currentScanStep, setCurrentScanStep] = useState<'location' | 'weather' | 'time' | 'mood'>('location');
  const [scanData, setScanData] = useState({
    location: '',
    weather: '',
    time: '',
    mood: ''
  });

  // Dummy data arrays (5 variations each)
  const dummyData = {
    locations: ['London, UK', 'Tokyo, Japan', 'New York, USA', 'Paris, France', 'Sydney, Australia'],
    weathers: ['Clear Night', 'Rainy Day', 'Sunny Morning', 'Cloudy Evening', 'Snowy Night'],
    times: ['Night', 'Morning', 'Afternoon', 'Evening', 'Midnight'],
    moods: ['Night Owl', 'Energetic', 'Relaxed', 'Focused', 'Dreamy']
  };

  // Continuous scanning animation with rotating data
  useEffect(() => {
    const scanSteps: Array<'location' | 'weather' | 'time' | 'mood'> = ['location', 'weather', 'time', 'mood'];
    let currentIndex = 0;
    let dataIndex = 0;

    const scanInterval = setInterval(() => {
      const step = scanSteps[currentIndex];
      if (!step) return;

      // Clear current step data to show "Detecting..." text
      setScanData(prev => ({
        ...prev,
        [step]: ''
      }));

      setCurrentScanStep(step);

      // Update data after a short delay with rotating dummy data
      setTimeout(() => {
        const value = step === 'location' ? dummyData.locations[dataIndex % 5] :
          step === 'weather' ? dummyData.weathers[dataIndex % 5] :
            step === 'time' ? dummyData.times[dataIndex % 5] :
              dummyData.moods[dataIndex % 5];

        setScanData(prev => ({
          ...prev,
          [step]: value
        }));
      }, 1200);

      currentIndex = (currentIndex + 1) % scanSteps.length;

      // Change data set when completing a full cycle
      if (currentIndex === 0) {
        dataIndex++;
      }
    }, 2500);

    return () => clearInterval(scanInterval);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#131213] text-white overflow-x-hidden relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="relative h-24 sm:h-28">
          {/* Logo - Absolute positioned */}
          <div className="absolute left-0 top-0 bottom-0 flex items-center z-10 px-8 sm:px-12 md:px-16 lg:px-24">
            <img
              src={hibeatsLogo}
              alt="HiBeats"
              className="h-6 sm:h-8 md:h-9 lg:h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation - Full width from 45% to right edge */}
          <div className="hidden md:absolute md:left-[56%] md:right-12 lg:left-[58%] lg:right-24 md:flex items-center h-full">
            {/* Rounded Background - Both sides rounded */}
            <div
              className="absolute bg-[#1d1d1d] rounded-full top-6 bottom-6 left-0 right-0"
            />

            {/* Navigation Links + Launch Button */}
            <div className="relative flex items-center justify-between w-full pl-6 lg:pl-7 pr-2">
              {/* Navigation Links with Even Spacing */}
              <div className="flex items-center gap-5 lg:gap-7">
                <a
                  href="#feed"
                  className="group relative flex items-center gap-0 hover:gap-1.5 px-0 hover:px-5 py-0 hover:py-2.5 rounded-full font-clash text-[17px] font-normal text-white hover:bg-[#131213] hover:text-[#d5fd4c] transition-all duration-300 whitespace-nowrap"
                >
                  Feed
                  <ChevronDown className="w-0 group-hover:w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden" />
                </a>
                <a
                  href="#explore"
                  className="group relative flex items-center gap-0 hover:gap-1.5 px-0 hover:px-5 py-0 hover:py-2.5 rounded-full font-clash text-[17px] font-normal text-white hover:bg-[#131213] hover:text-[#d5fd4c] transition-all duration-300 whitespace-nowrap"
                >
                  Explore
                  <ChevronDown className="w-0 group-hover:w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden" />
                </a>
                <a
                  href="#yourvibe"
                  className="group relative flex items-center gap-0 hover:gap-1.5 px-0 hover:px-5 py-0 hover:py-2.5 rounded-full font-clash text-[17px] font-normal text-white hover:bg-[#131213] hover:text-[#d5fd4c] transition-all duration-300 whitespace-nowrap"
                >
                  Your Vibe
                  <ChevronDown className="w-0 group-hover:w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden" />
                </a>
                <a
                  href="#playlist"
                  className="group relative flex items-center gap-0 hover:gap-1.5 px-0 hover:px-5 py-0 hover:py-2.5 rounded-full font-clash text-[17px] font-normal text-white hover:bg-[#131213] hover:text-[#d5fd4c] transition-all duration-300 whitespace-nowrap"
                >
                  My Playlist
                  <ChevronDown className="w-0 group-hover:w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden" />
                </a>
              </div>

              {/* Join Beta Button Inside Nav Container */}
              <button
                onClick={handleLaunchApp}
                className="group relative h-11 lg:h-12 rounded-full bg-[#131213] hover:bg-[#d5fd4c] flex items-center justify-center overflow-hidden transition-all duration-300 w-11 lg:w-12 hover:w-[130px] lg:hover:w-[140px]"
              >
                {/* Text that appears on hover */}
                <span className="absolute left-3.5 font-clash font-medium text-[15px] lg:text-[16px] text-white group-hover:text-black opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                  Join Beta!
                </span>

                {/* Icon - positioned absolutely to stay centered */}
                <div className="absolute right-0 w-11 h-11 lg:w-12 lg:h-12 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:text-black transition-colors duration-300" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="absolute right-4 top-0 bottom-0 flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors z-10"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#2a1f3d]/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              <a
                href="#feed"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 font-clash text-base font-medium text-white hover:text-[#d5fd4c] hover:bg-white/5 rounded-lg transition-colors"
              >
                Feed
              </a>
              <a
                href="#explore"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 font-clash text-base font-medium text-white hover:text-[#d5fd4c] hover:bg-white/5 rounded-lg transition-colors"
              >
                Explore
              </a>
              <a
                href="#yourvibe"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 font-clash text-base font-medium text-white hover:text-[#d5fd4c] hover:bg-white/5 rounded-lg transition-colors"
              >
                Your Vibe
              </a>
              <a
                href="#playlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 font-clash text-base font-medium text-white hover:text-[#d5fd4c] hover:bg-white/5 rounded-lg transition-colors"
              >
                My Playlist
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLaunchApp();
                }}
                className="w-full px-4 py-3 bg-[#d5fd4c] rounded-lg font-clash font-medium text-base text-black hover:bg-[#e5ff6c] transition-all mt-2"
              >
                Join Beta!
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 lg:pt-40 pb-8 sm:pb-12 lg:pb-16 px-4 sm:px-6">
        {/* Line Background */}
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
          <img
            src={lineImage}
            alt=""
            className="w-full h-auto object-contain opacity-90"
            style={{ transform: 'translateY(-5%) scaleY(0.7)' }}
          />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Waveform Image */}
          <div className="relative w-full max-w-lg lg:max-w-2xl mx-auto mb-2">
            <img
              src={waveformImage}
              alt="Waveform"
              className="w-full h-auto"
            />
          </div>

          {/* Main Heading with Animated Text */}
          <div className="relative mb-3 sm:mb-4 lg:mb-6">
            {/* Abstract decorations */}
            <img
              src={abstractImage}
              alt=""
              className="absolute left-0 sm:left-10 md:left-20 lg:left-28 top-[70%] w-12 sm:w-20 md:w-24 lg:w-28 h-auto opacity-80 z-0"
            />
            <img
              src={abstract2Image}
              alt=""
              className="absolute -right-4 sm:right-4 md:right-12 lg:right-16 top-[45%] w-20 sm:w-28 md:w-36 lg:w-44 h-auto opacity-80 z-0"
            />

            <h1 className="font-clash font-medium text-[1.575rem] sm:text-[2.625rem] md:text-[3.2813rem] lg:text-[3.2813rem] xl:text-[3.9375rem] leading-tight text-white px-4 relative z-10">
              SocialFi Platform for
              <span className="inline-flex items-center relative">
                {' '}A
                <img
                  src={geminiLogo}
                  alt="Gemini"
                  className="absolute -top-[0.6563rem] sm:-top-[0.7875rem] md:-top-[0.9188rem] lg:-top-[1.05rem] left-1/2 -translate-x-1/2 h-[1.05rem] sm:h-[1.3125rem] md:h-[1.575rem] lg:h-[2.1rem] w-auto object-contain"
                  style={{ aspectRatio: 'auto' }}
                />
                I
              </span>
              <br />
              <span className="inline-flex items-center gap-[0.525rem] sm:gap-[0.7875rem] flex-wrap justify-center">
                Music Creation, <AnimatedText />and Earn
              </span>
            </h1>
          </div>

          {/* Powered by Gemini */}
          <div className="flex items-center justify-center gap-1.5 mb-3 sm:mb-4 lg:mb-5">
            <p className="font-clash text-xs sm:text-sm text-white">Powered by</p>
            <img src={ASSETS.geminiLogo} alt="Gemini" className="h-3.5 sm:h-5 lg:h-6 w-auto" />
          </div>

          {/* CTA Button with Border and Corner Fill */}
          <button
            onClick={handleLaunchApp}
            className="group relative px-5 sm:px-7 lg:px-8 py-1.5 sm:py-2 lg:py-2.5 rounded-[24px] font-clash font-medium text-base sm:text-lg lg:text-xl overflow-visible bg-black mt-2 sm:mt-3 lg:mt-4 transition-all duration-500"
          >
            {/* Glow Effect - Behind button on hover */}
            <div className="absolute inset-0 rounded-[24px] bg-[#d5fd4c] opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" style={{ zIndex: -1, transform: 'scale(1.05)' }} />

            {/* Border */}
            <div className="absolute inset-0 border-3 border-[#d5fd4c] rounded-[24px]" style={{ borderWidth: '2.5px' }} />

            {/* Animated Fill - Expands from corner to full on hover */}
            <div
              className="absolute inset-0 bg-[#d5fd4c] rounded-[24px] corner-fill-animation"
              style={{
                clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 82% 100%)',
                transition: 'clip-path 500ms ease-in-out'
              }}
            />

            {/* Text with Slide Animation */}
            <span className="relative z-10 inline-block overflow-hidden">
              {/* White Text - Slides up on hover */}
              <span className="block text-white transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                Join Beta!
              </span>
              {/* Black Text - Slides in from bottom on hover */}
              <span className="absolute inset-0 text-black transition-transform duration-500 ease-in-out translate-y-full group-hover:translate-y-0">
                Join Beta!
              </span>
            </span>
          </button>

          {/* Scroll Indicator */}
          <div className="mt-6 sm:mt-8 lg:mt-12 flex justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#d5fd4c] flex items-center justify-center animate-bounce">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#d5fd4c] rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* AI Music Agent Section */}
      <section id="yourvibe" className="relative py-8 sm:py-12 lg:py-16 px-4 sm:px-6 overflow-hidden pb-0">
        {/* Audio Visualizer Background */}
        <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />

        <div className="max-w-6xl mx-auto relative z-10 pb-12 sm:pb-16 lg:pb-20 pt-4 sm:pt-6 lg:pt-8">
          <h2 className="font-clash font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center mb-2 leading-tight">
            <span className="bg-gradient-to-r from-[#d0ff00] to-white bg-clip-text text-transparent">
              hibeats
            </span>{' '}
            SocialFi Music Platform
          </h2>

          <p className="font-clash text-sm sm:text-base lg:text-lg text-[#d5fd4c] text-center mb-3 sm:mb-4 max-w-2xl mx-auto px-4">
            Create AI-generated music, connect with creators, and earn rewards.<br />Like, comment, tip, and trade music NFTs in a decentralized economy.
          </p>

          {/* Simple Audio Player Controls */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 mb-2 sm:mb-3 lg:mb-4">
            <button
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:scale-110 transition-transform"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                }
              }}
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="white" viewBox="0 0 24 24">
                <path d="M6 4l12 8-12 8V4z" transform="scale(-1, 1) translate(-24, 0)" />
              </svg>
            </button>

            <button
              onClick={togglePlayPause}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-black fill-black" />
              ) : (
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-black fill-black ml-1" />
              )}
            </button>

            <button
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:scale-110 transition-transform"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
                }
              }}
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="white" viewBox="0 0 24 24">
                <path d="M6 4l12 8-12 8V4z" />
              </svg>
            </button>
          </div>

        </div>
      </section>

      {/* Albums Infinite Scroll - Full Width Section */}
      <section className="relative w-full -mt-8 sm:-mt-12 lg:-mt-16">
        <AlbumGrid albums={ASSETS.albums} />
      </section>

      {/* Continue AI Music Agent Section */}
      <section className="relative px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">

          {/* Context Info - Location, Weather, Time, Mood with Scanning Animation */}
          <div className="grid grid-cols-4 sm:flex sm:items-center sm:justify-center gap-4 sm:gap-5 lg:gap-6 mt-2 sm:mt-3 lg:mt-4 px-4 max-w-md sm:max-w-none mx-auto">
            {/* Location */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${currentScanStep === 'location'
                  ? 'border-white bg-white/10 animate-pulse'
                  : scanData.location
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-white/30'
                }`}>
                <MapPin className={`w-7 h-7 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${currentScanStep === 'location' || scanData.location ? 'text-white' : 'text-white/50'}`} />
              </div>
              <span className={`text-xs sm:text-sm text-center max-w-[90px] truncate transition-all duration-300 ${currentScanStep === 'location' ? 'text-white font-medium animate-pulse' : 'text-white/70'
                }`}>
                {scanData.location || (currentScanStep === 'location' ? 'Detecting...' : 'Location')}
              </span>
            </div>

            {/* Weather */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${currentScanStep === 'weather'
                  ? 'border-white bg-white/10 animate-pulse'
                  : scanData.weather
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-white/30'
                }`}>
                <Cloud className={`w-7 h-7 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${currentScanStep === 'weather' || scanData.weather ? 'text-white' : 'text-white/50'}`} />
              </div>
              <span className={`text-xs sm:text-sm text-center max-w-[90px] truncate transition-all duration-300 ${currentScanStep === 'weather' ? 'text-white font-medium animate-pulse' : 'text-white/70'
                }`}>
                {scanData.weather || (currentScanStep === 'weather' ? 'Checking...' : 'Weather')}
              </span>
            </div>

            {/* Time */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${currentScanStep === 'time'
                  ? 'border-white bg-white/10 animate-pulse'
                  : scanData.time
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-white/30'
                }`}>
                <Timer className={`w-7 h-7 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${currentScanStep === 'time' || scanData.time ? 'text-white' : 'text-white/50'}`} />
              </div>
              <span className={`text-xs sm:text-sm text-center max-w-[90px] truncate transition-all duration-300 ${currentScanStep === 'time' ? 'text-white font-medium animate-pulse' : 'text-white/70'
                }`}>
                {scanData.time || (currentScanStep === 'time' ? 'Analyzing...' : 'Time')}
              </span>
            </div>

            {/* Mood */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${currentScanStep === 'mood'
                  ? 'border-[#d5fd4c] bg-[#d5fd4c]/20 animate-pulse'
                  : scanData.mood
                    ? 'border-[#d5fd4c]/50 bg-[#d5fd4c]/10'
                    : 'border-white/30'
                }`}>
                <Sparkles className={`w-7 h-7 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${currentScanStep === 'mood' || scanData.mood ? 'text-[#d5fd4c]' : 'text-white/50'}`} />
              </div>
              <span className={`text-xs sm:text-sm text-center max-w-[90px] truncate transition-all duration-300 ${currentScanStep === 'mood' ? 'text-white font-medium animate-pulse' : 'text-white/70'
                }`}>
                {scanData.mood || (currentScanStep === 'mood' ? 'AI Analyzing...' : 'Mood')}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="font-clash text-base sm:text-lg lg:text-xl text-center text-white/80 mt-8 sm:mt-10 lg:mt-12 max-w-4xl mx-auto leading-relaxed px-4">
            Generate professional music with AI based on your location, weather, time, and mood. Mint as NFTs, share with the community, and earn through social engagement.
          </p>

          {/* Genre Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-4">
            {['Hip-Hop', 'Electronic', 'Lo-Fi', 'Rock'].map((genre) => (
              <div
                key={genre}
                className="group relative px-4 sm:px-6 py-1 sm:py-1.5 rounded-full border-2 border-[#d5fd4c] hover:border-purple-600 bg-black/40 backdrop-blur-sm overflow-hidden cursor-pointer transition-colors duration-500"
              >
                {/* Animated Fill - Expands from corner to full on hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full"
                  style={{
                    clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 82% 100%)',
                    transition: 'clip-path 500ms ease-in-out'
                  }}
                />

                {/* Text with Slide Animation */}
                <span className="relative z-10 inline-block overflow-hidden">
                  {/* White Text - Slides up on hover */}
                  <span className="block font-clash text-sm sm:text-base font-medium text-white transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                    {genre}
                  </span>
                  {/* Lime Text - Slides in from bottom on hover */}
                  <span className="absolute inset-0 font-clash text-sm sm:text-base font-medium text-[#d5fd4c] transition-transform duration-500 ease-in-out translate-y-full group-hover:translate-y-0">
                    {genre}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Second row of badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 px-4">
            {['Ambient', 'Other'].map((genre) => (
              <div
                key={genre}
                className="group relative px-4 sm:px-6 py-1 sm:py-1.5 rounded-full border-2 border-[#d5fd4c] hover:border-purple-600 bg-black/40 backdrop-blur-sm overflow-hidden cursor-pointer transition-colors duration-500"
              >
                {/* Animated Fill - Expands from corner to full on hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full"
                  style={{
                    clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 82% 100%)',
                    transition: 'clip-path 500ms ease-in-out'
                  }}
                />

                {/* Text with Slide Animation */}
                <span className="relative z-10 inline-block overflow-hidden">
                  {/* White Text - Slides up on hover */}
                  <span className="block font-clash text-sm sm:text-base font-medium text-white transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                    {genre}
                  </span>
                  {/* Lime Text - Slides in from bottom on hover */}
                  <span className="absolute inset-0 font-clash text-sm sm:text-base font-medium text-[#d5fd4c] transition-transform duration-500 ease-in-out translate-y-full group-hover:translate-y-0">
                    {genre}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Economy Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Card Container with Border */}
          <div className="relative rounded-[50px] sm:rounded-[60px] lg:rounded-[80px] border-2 border-[#d0ff00] bg-black/40 backdrop-blur-sm p-6 sm:p-8 lg:p-12 pb-20 sm:pb-24 lg:pb-28 shadow-[0_0_40px_rgba(208,255,0,0.3)] overflow-hidden">
            {/* Decorative tin image - top right, aligned with heading */}
            <img
              src={tinImage}
              alt=""
              className="absolute top-6 right-6 sm:top-8 sm:right-8 lg:top-12 lg:right-12 w-16 sm:w-20 lg:w-24 h-auto opacity-100 z-0"
            />

            {/* Decorative tin2 image - bottom left */}
            <img
              src={tin2Image}
              alt=""
              className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 w-16 sm:w-20 lg:w-24 h-auto opacity-100 z-0"
            />

            <h2 className="font-clash font-medium text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-8 sm:mb-10 lg:mb-12 relative z-10">
              <span className="bg-gradient-to-r from-[#d5fd4c] to-white bg-clip-text text-transparent">
                hibeats
              </span>{' '}
              SocialFi Platform for
              <br />
              Music Creators
            </h2>

            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 relative z-10">
              <div className="space-y-6 sm:space-y-8 lg:space-y-12">
                <div>
                  <h3 className="font-clash font-medium text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 lg:mb-4">AI-Powered Creation</h3>
                  <p className="font-clash text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed">
                    Generate professional music with AI, mint as NFTs, and own your creations with blockchain-verified ownership and programmable royalties
                  </p>
                </div>

                <div>
                  <h3 className="font-clash font-medium text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 lg:mb-4">Social Engagement</h3>
                  <p className="font-clash text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed">
                    Connect with creators through real-time interactions—like, comment, share, and message. Build your community with encrypted messaging and live presence indicators
                  </p>
                </div>

                <div>
                  <h3 className="font-clash font-medium text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 lg:mb-4">Earn & Trade</h3>
                  <p className="font-clash text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed">
                    Monetize your music through NFT sales, receive tips from fans, earn BeatsXP rewards for engagement, and trade in a decentralized marketplace with transparent royalties
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
                  <img
                    src={socialFiImages[currentImageIndex]}
                    alt="SocialFi Platform Features"
                    className={`w-full h-auto transition-opacity duration-500 ${isImageFading ? 'opacity-0' : 'opacity-100'
                      }`}
                  />
                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
                    {socialFiImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsImageFading(true);
                          setTimeout(() => {
                            setCurrentImageIndex(index);
                            setIsImageFading(false);
                          }, 500);
                        }}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                            ? 'bg-[#d5fd4c] w-4 sm:w-6'
                            : 'bg-white/50 hover:bg-white/80'
                          }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Albums Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="font-clash font-medium text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">Recent Albums & EPs</h2>
              <p className="font-clash text-sm sm:text-base lg:text-lg text-[#d5fd4c]">Discover albums from our community</p>
            </div>

            <button
              onClick={() => navigate('/beats')}
              className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 border-2 border-[#d5fd4c] rounded-full hover:bg-[#d5fd4c] hover:text-black transition-all group"
            >
              <span className="font-clash text-sm sm:text-base lg:text-lg">View All Albums</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-black/20">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - 3 Small Albums Stacked */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Shattered Glow */}
              <div className="relative rounded-[40px] overflow-hidden border-2 border-[#d5fd4c] bg-black/60 backdrop-blur-sm h-48">
                <img src={ASSETS.albumCovers.shatteredGlow} alt="Shattered Glow" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-end">
                    <span className="px-3 py-1 bg-black/70 border border-white/50 rounded-full font-clash text-xs">
                      SINGLE
                    </span>
                  </div>
                  <div>
                    <h3 className="font-clash font-medium text-xl sm:text-2xl mb-1">Shattered Glow</h3>
                    <p className="font-clash text-sm text-white/80 mb-1">hibeatslovers</p>
                    <p className="font-clash text-xs text-white/60 mb-3">Nov 30</p>
                    <button
                      onClick={() => navigate('/beats')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d5fd4c] text-black rounded-full hover:scale-105 transition-transform font-clash text-sm font-medium"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      View Album
                    </button>
                  </div>
                </div>
              </div>

              {/* Moonlit Rendezvous */}
              <div className="relative rounded-[40px] overflow-hidden border-2 border-[#d5fd4c] bg-black/60 backdrop-blur-sm h-48">
                <img src={ASSETS.albumCovers.moonlitRendezvous} alt="Moonlit Rendezvous" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-end">
                    <span className="px-3 py-1 bg-black/70 border border-white/50 rounded-full font-clash text-xs">
                      SINGLE
                    </span>
                  </div>
                  <div>
                    <h3 className="font-clash font-medium text-xl sm:text-2xl mb-1">Moonlit Rendezvous</h3>
                    <p className="font-clash text-sm text-white/80 mb-1">hibeatslovers</p>
                    <p className="font-clash text-xs text-white/60 mb-3">Nov 27</p>
                    <button
                      onClick={() => navigate('/beats')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d5fd4c] text-black rounded-full hover:scale-105 transition-transform font-clash text-sm font-medium"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      View Album
                    </button>
                  </div>
                </div>
              </div>

              {/* Shattered Currents */}
              <div className="relative rounded-[40px] overflow-hidden border-2 border-[#d5fd4c] bg-black/60 backdrop-blur-sm h-48">
                <img src={ASSETS.albumCovers.shatteredCurrents} alt="Shattered Currents" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-end">
                    <span className="px-3 py-1 bg-black/70 border border-white/50 rounded-full font-clash text-xs">
                      SINGLE
                    </span>
                  </div>
                  <div>
                    <h3 className="font-clash font-medium text-xl sm:text-2xl mb-1">Shattered Currents</h3>
                    <p className="font-clash text-sm text-white/80 mb-1">hibeatslovers</p>
                    <p className="font-clash text-xs text-white/60 mb-3">Nov 22</p>
                    <button
                      onClick={() => navigate('/beats')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d5fd4c] text-black rounded-full hover:scale-105 transition-transform font-clash text-sm font-medium"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      View Album
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - 1 Large Album */}
            <div className="relative rounded-[40px] overflow-hidden border-2 border-[#d5fd4c] bg-black/60 backdrop-blur-sm">
              <img src={ASSETS.albumCovers.moonlitRendezvous} alt="Velvet Under Moonlight" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex justify-end">
                  <span className="px-4 py-2 bg-black/70 border border-white/50 rounded-full font-clash text-sm">
                    SINGLE
                  </span>
                </div>
                <div>
                  <h3 className="font-clash font-medium text-3xl sm:text-4xl mb-2">Velvet Under Moonlight</h3>
                  <p className="font-clash text-lg text-white/90 mb-2">claocleo</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-pink-500 text-white rounded-full font-clash text-xs font-medium">smooth +</span>
                    <span className="font-clash text-sm text-white/70">1 track</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-clash text-sm text-white/60">♫ 1 track</span>
                    <span className="font-clash text-sm text-white/60">Dec 1</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/beats')}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#d5fd4c] text-black rounded-full hover:scale-105 transition-transform font-clash text-base font-medium"
                    >
                      <Play className="w-5 h-5 fill-black" />
                      View Album
                    </button>
                    <button className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Logo Scroll - Somnia with Group 10 */}
      <section className="relative w-full">
        <InfiniteLogoScroll />
      </section>

      {/* Ecosystem Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-clash font-medium text-2xl sm:text-3xl lg:text-4xl text-center mb-8 sm:mb-10 lg:mb-12">
            Our Ecosystem is Expanding Fast
          </h2>

          {/* Divider */}
          <div className="max-w-[1728px] mx-auto mb-8 sm:mb-10 lg:mb-12">
            <div className="h-[3px] bg-[#d5fd4c] w-full" />
          </div>

          <EcosystemGrid ecosystem={ASSETS.ecosystem} />
        </div>
      </section>

      {/* Reviews Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <ReviewCarousel />
        </div>
      </section>

      {/* Footer Animated Images */}
      <section className="relative py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedFooterImages />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 sm:py-10 lg:py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Left Side - Logo and Info in Row */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 lg:gap-8">
              {/* Logo */}
              <img
                src={hibeatsLogo}
                alt="HiBeats"
                className="h-10 sm:h-12 lg:h-14 w-auto flex-shrink-0"
              />

              {/* Info Section */}
              <div className="text-center md:text-left">
                <p className="font-clash text-xs sm:text-sm text-white/70 mb-1">© 2025 HiBeats. All rights reserved.</p>
                <p className="font-clash text-[10px] sm:text-xs text-[#d5fd4c]/80 mb-2">SocialFi Platform for AI Music Creation</p>
                <div className="flex gap-4 sm:gap-6 justify-center md:justify-start">
                  <Link to="/terms" className="font-clash text-xs sm:text-sm text-white hover:text-[#d5fd4c] transition-colors">
                    Terms of Use
                  </Link>
                  <Link to="/privacy" className="font-clash text-xs sm:text-sm text-white hover:text-[#d5fd4c] transition-colors">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Social Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {Object.values(ASSETS.socialIcons).map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                >
                  <img src={icon} alt="Social" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
