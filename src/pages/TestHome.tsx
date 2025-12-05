import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Share2, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TestHome = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0118] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0118]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#c0ff00] to-[#00ff88] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold">hibeats</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm hover:text-[#c0ff00] transition-colors">HOME</a>
            <a href="#" className="text-sm hover:text-[#c0ff00] transition-colors">AI BEATS</a>
            <a href="#" className="text-sm hover:text-[#c0ff00] transition-colors">TRADE BEAT</a>
            <a href="#" className="text-sm hover:text-[#c0ff00] transition-colors">NFT MARKET</a>
          </div>

          <Button className="bg-[#c0ff00] text-black hover:bg-[#a8e600] font-semibold px-6">
            LAUNCH APP
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Waveform Visualization */}
          <div className="flex items-center justify-center gap-1 mb-8">
            <div className="w-1 bg-[#c0ff00] rounded-full animate-pulse" style={{ height: '40px' }} />
            <div className="w-1 bg-[#c0ff00] rounded-full animate-pulse" style={{ height: '60px', animationDelay: '0.1s' }} />
            <div className="w-1 bg-[#c0ff00] rounded-full animate-pulse" style={{ height: '80px', animationDelay: '0.2s' }} />
            <div className="w-1 bg-[#c0ff00] rounded-full animate-pulse" style={{ height: '50px', animationDelay: '0.3s' }} />
            <div className="w-1 bg-[#c0ff00] rounded-full animate-pulse" style={{ height: '70px', animationDelay: '0.4s' }} />
            <div className="w-1 bg-[#c0ff00] rounded-full animate-pulse" style={{ height: '90px', animationDelay: '0.5s' }} />
            <div className="w-1 bg-[#c0ff00] rounded-full animate-pulse" style={{ height: '60px', animationDelay: '0.6s' }} />
            <div className="w-1 bg-[#c0ff00] rounded-full animate-pulse" style={{ height: '40px', animationDelay: '0.7s' }} />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight">
            Create Your Own Song With AI<br />
            and <span className="text-[#c0ff00]">Trade Your Song</span>
          </h1>

          {/* Powered by Somnia Badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 flex items-center gap-2">
              <span className="text-sm text-gray-400">Powered by</span>
              <span className="text-[#c0ff00] font-bold">SOMNIA</span>
            </div>
          </div>

          {/* Learn More Button */}
          <div className="flex justify-center mb-16">
            <Button className="bg-transparent border-2 border-[#c0ff00] text-[#c0ff00] hover:bg-[#c0ff00] hover:text-black transition-all px-8 py-6 text-lg rounded-full">
              Learn More 🎵
            </Button>
          </div>

          {/* AI Music Agent Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-[#c0ff00]">hibeats</span> AI Music Agent
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Harness the power of AI to create unique beats and melodies. Trade your creations as NFTs on our marketplace.
            </p>
          </div>

          {/* Music Player Card */}
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12">
            <div className="flex items-center justify-center gap-6 mb-6">
              <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-[#c0ff00] hover:bg-[#a8e600] flex items-center justify-center transition-all shadow-lg shadow-[#c0ff00]/50"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-black" />
                ) : (
                  <Play className="w-7 h-7 text-black ml-1" />
                )}
              </button>
              
              <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Album Art Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 overflow-hidden">
                <img src="/placeholder.svg" alt="Album 1" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden">
                <img src="/placeholder.svg" alt="Album 2" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 overflow-hidden">
                <img src="/placeholder.svg" alt="Album 3" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <Heart className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <div className="bg-[#c0ff00] text-black px-6 py-3 rounded-full font-bold text-sm">
              AI GENERATED
            </div>
            <div className="bg-[#c0ff00] text-black px-6 py-3 rounded-full font-bold text-sm">
              NFT MARKETPLACE
            </div>
            <div className="bg-[#c0ff00] text-black px-6 py-3 rounded-full font-bold text-sm">
              TRADE BEATS
            </div>
            <div className="bg-[#c0ff00] text-black px-6 py-3 rounded-full font-bold text-sm">
              EARN REWARDS
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <div className="flex items-start gap-8">
              <div className="flex-1">
                <div className="inline-block bg-[#c0ff00]/10 border border-[#c0ff00] rounded-full px-4 py-1 mb-4">
                  <span className="text-[#c0ff00] text-sm font-bold">NEW FEATURE</span>
                </div>
                
                <h3 className="text-3xl font-bold mb-4">
                  hibeats Turns Music AI Into<br />
                  an Open Economy
                </h3>
                
                <div className="space-y-4 text-gray-400">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#c0ff00] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                    <p>AI-Powered Music Generation</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#c0ff00] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                    <p>Trade Your Beats as NFTs</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#c0ff00] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                    <p>Earn Rewards for Your Creativity</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#c0ff00] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                    <p>Open Creator Economy</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden">
                  <img src="/placeholder.svg" alt="Feature" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Albums Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Recent Albums & EPs</h2>
            <Button className="bg-transparent border border-white/20 hover:border-[#c0ff00] hover:text-[#c0ff00]">
              View All →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Album Card 1 */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#c0ff00]/50 transition-all">
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-[#c0ff00] text-black px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">
                    NEW RELEASE
                  </div>
                  <h3 className="text-xl font-bold mb-2">Shes Like a Wave</h3>
                  <p className="text-gray-400 text-sm mb-3">Electronic • 2024</p>
                  <Button className="bg-[#c0ff00] text-black hover:bg-[#a8e600] w-full">
                    Listen Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Album Card 2 */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#c0ff00]/50 transition-all">
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-[#c0ff00] text-black px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">
                    TRENDING
                  </div>
                  <h3 className="text-xl font-bold mb-2">Moonlit Harmonics</h3>
                  <p className="text-gray-400 text-sm mb-3">Ambient • 2024</p>
                  <Button className="bg-[#c0ff00] text-black hover:bg-[#a8e600] w-full">
                    Listen Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Album Card 3 */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#c0ff00]/50 transition-all">
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">
                    FEATURED
                  </div>
                  <h3 className="text-xl font-bold mb-2">Diamonds Forever</h3>
                  <p className="text-gray-400 text-sm mb-3">Hip Hop • 2024</p>
                  <Button className="bg-[#c0ff00] text-black hover:bg-[#a8e600] w-full">
                    Listen Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Album Card 4 */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#c0ff00]/50 transition-all">
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">
                    HOT
                  </div>
                  <h3 className="text-xl font-bold mb-2">Velvet Under Moonlight</h3>
                  <p className="text-gray-400 text-sm mb-3">Jazz • 2024</p>
                  <Button className="bg-[#c0ff00] text-black hover:bg-[#a8e600] w-full">
                    Listen Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Somnia Ecosystem Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Decorative Network Lines */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c0ff00" stopOpacity="0" />
                  <stop offset="50%" stopColor="#c0ff00" stopOpacity="1" />
                  <stop offset="100%" stopColor="#c0ff00" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0 100 Q 300 50 600 100 T 1200 100" stroke="url(#line-gradient)" strokeWidth="2" fill="none" />
              <path d="M 0 200 Q 300 250 600 200 T 1200 200" stroke="url(#line-gradient)" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <h2 className="text-4xl font-bold text-center mb-4">
            Our Ecosystem is Expanding Fast
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Join thousands of creators building the future of music on the blockchain
          </p>

          {/* Partner Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex items-center justify-center hover:border-[#c0ff00]/50 transition-all">
              <span className="text-2xl font-bold">hibeats Music</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex items-center justify-center hover:border-[#c0ff00]/50 transition-all">
              <span className="text-2xl font-bold">Moon Craft</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex items-center justify-center hover:border-[#c0ff00]/50 transition-all">
              <span className="text-2xl font-bold">Luna Games</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex items-center justify-center hover:border-[#c0ff00]/50 transition-all">
              <span className="text-2xl font-bold">GRumble</span>
            </div>
          </div>

          {/* Featured Artist */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#c0ff00] to-[#00ff88] mx-auto mb-6 overflow-hidden">
              <img src="/placeholder.svg" alt="Riley Williams" className="w-full h-full object-cover" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Riley Williams</h3>
            <p className="text-gray-400 mb-6">Featured Artist</p>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 fill-[#c0ff00] text-[#c0ff00]" />
              ))}
            </div>
            
            <p className="text-gray-300 max-w-2xl mx-auto mb-8 italic">
              "hibeats has revolutionized how I create and share my music. The AI tools are incredible, 
              and the NFT marketplace has opened up new revenue streams I never thought possible."
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                ←
              </button>
              <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#c0ff00] to-[#00ff88] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-bold">hibeats</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Powered by Somnia Blockchain</span>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <span className="text-sm">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <span className="text-sm">D</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <span className="text-sm">T</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <span className="text-sm">G</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TestHome;
