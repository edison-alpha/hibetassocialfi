import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Play,
  Pause,
  Heart,
  Share2,
  Music,
  Clock,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCallback, memo } from "react";
import Navbar from "@/components/Navbar";
import { useAudio } from "@/contexts/AudioContext";
import { useAccount } from "wagmi";
import { recordMusicPlay } from "@/utils/playCountHelper";
import { useBeats } from "@/hooks/useBeats";
import { LazyImage } from "@/components/LazyImage";
import hibeatsLogo from "@/assets/hibeats brand.svg";

// Format date function: "2025-11-29T18:29:28.000Z" -> "29 Nov 2025 18:29"
const formatReleaseDate = (dateString: string): string => {
  if (!dateString) return 'Nov 30';
  
  try {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Skeleton loader component for mobile
const BeatCardSkeleton = memo(() => (
  <Card className="border-border/20 bg-card/50 backdrop-blur-sm overflow-hidden rounded-xl">
    <CardContent className="p-0">
      <Skeleton className="w-full aspect-square" />
      <div className="p-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-6 h-6 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-2/3" />
          </div>
        </div>
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-6 w-full rounded-full" />
      </div>
    </CardContent>
  </Card>
));
BeatCardSkeleton.displayName = 'BeatCardSkeleton';

// Skeleton loader component for desktop
const BeatCardSkeletonDesktop = memo(() => (
  <div className="relative overflow-hidden rounded-[32px] border-2 border-border/20 h-[180px]">
    <Skeleton className="absolute inset-0" />
    <div className="relative h-full flex items-center px-10 py-8">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-36 rounded-full mt-3" />
      </div>
      <Skeleton className="absolute top-5 right-6 h-7 w-20 rounded-full" />
    </div>
  </div>
));
BeatCardSkeletonDesktop.displayName = 'BeatCardSkeletonDesktop';

// Memoized beat card component
interface BeatCardProps {
  beat: any;
  currentTrack: any;
  isPlaying: boolean;
  onPlay: (beat: any) => void;
  onPause: () => void;
}

const BeatCard = memo(({ beat, currentTrack, isPlaying, onPlay, onPause }: BeatCardProps) => {
  const isCurrentTrack = currentTrack?.id === beat.id;
  const isCurrentPlaying = isCurrentTrack && isPlaying;

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPlaying) {
      onPause();
    } else {
      onPlay(beat);
    }
  }, [isCurrentPlaying, onPause, onPlay, beat]);



  return (
    <>
      {/* Mobile/Tablet Card (Grid Layout) - Hidden on Desktop */}
      <Card className="md:hidden group hover:shadow-lg transition-all duration-300 border-border/20 bg-card/50 backdrop-blur-sm overflow-hidden rounded-xl">
        <CardContent className="p-0">
          {/* Album Cover */}
          <div className="relative w-full aspect-square overflow-hidden">
            <LazyImage
              src={beat.cover}
              alt={beat.title}
              className="w-full h-full object-cover"
              fallback={hibeatsLogo}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                size="lg"
                className="rounded-full w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0"
                onClick={handlePlayClick}
              >
                {isCurrentPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </Button>
            </div>
            <Badge className="absolute top-2 left-2 bg-transparent border-white/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1" />
              {beat.albumType}
            </Badge>
          </div>

          {/* Beat Details */}
          <div className="p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Avatar className="w-6 h-6">
                <AvatarImage src={beat.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {beat.avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link to={`/album/${beat.albumId}`}>
                  <h3 className="font-semibold text-xs mb-0.5 hover:text-primary transition-colors truncate">{beat.title}</h3>
                </Link>
                <p className="text-muted-foreground text-[10px] truncate">{beat.artist}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-[10px] text-muted-foreground mb-1.5">
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                <span className="text-[9px]">{beat.duration}</span>
              </span>
              <Badge variant="secondary" className="text-[9px] rounded-full px-1.5 py-0 bg-muted/50 truncate max-w-[70px]">
                {beat.genre}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                className="flex-1 gap-0.5 rounded-full h-6 text-[10px] px-2"
                onClick={handlePlayClick}
              >
                {isCurrentPlaying ? (
                  <Pause className="w-2.5 h-2.5" />
                ) : (
                  <Play className="w-2.5 h-2.5" />
                )}
                <span className="hidden xs:inline">Play</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-6 px-1.5">
                <Heart className="w-2.5 h-2.5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-6 px-1.5">
                <Share2 className="w-2.5 h-2.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Card (Horizontal Layout with Cover Background) - Hidden on Mobile/Tablet */}
      <div className="hidden md:block group relative overflow-hidden rounded-[32px] border-2 border-[#c4ff0d]/30 hover:border-[#c4ff0d]/60 transition-all duration-300 h-[180px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <LazyImage
            src={beat.cover}
            alt={beat.title}
            className="w-full h-full object-cover"
            fallback={hibeatsLogo}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center px-10 py-8">
          {/* Left Side - Text Content */}
          <div className="flex-1 space-y-1.5">
            <Link to={`/album/${beat.albumId}`}>
              <h2 className="font-clash font-light text-2xl leading-tight text-white hover:text-[#c4ff0d] transition-colors line-clamp-1">
                {beat.title}
              </h2>
            </Link>
            <p className="text-white/70 text-xs font-light">
              {beat.artist}
            </p>
            <p className="text-white/50 text-[11px] font-light">
              {formatReleaseDate(beat.releaseDate)}
            </p>
            
            {/* View Album Button */}
            <Link to={`/album/${beat.albumId}`}>
              <Button 
                size="sm"
                className="rounded-full px-6 py-2 h-9 text-sm gap-2 mt-4 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <Play className="w-4 h-4 fill-current" />
                View Album
              </Button>
            </Link>
          </div>

          {/* Right Side - Badge */}
          <div className="absolute top-5 right-6">
            <Badge className="bg-black/80 border border-white/40 text-white text-xs px-4 py-1 rounded-full backdrop-blur-sm font-light tracking-widest">
              {beat.albumType?.toUpperCase() || 'SINGLE'}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
});
BeatCard.displayName = 'BeatCard';

const Beats = () => {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();
  const { address } = useAccount();
  const { beats, genres, selectedGenre, setSelectedGenre, isLoading, error } = useBeats(50);

  // Memoized play handler
  const handlePlay = useCallback((beat: any) => {
    const trackData: any = {
      id: beat.id,
      title: beat.title,
      artist: beat.artist,
      avatar: beat.avatar || '',
      cover: beat.cover,
      genre: beat.genre,
      audioHash: beat.audioHash,
      duration: beat.duration,
      likes: beat.likes
    };
    playTrack(trackData);
    
    // Record play event
    const duration = typeof beat.duration === 'string' 
      ? parseInt(beat.duration.split(':')[0]) * 60 + parseInt(beat.duration.split(':')[1] || '0')
      : 180;
    void recordMusicPlay(trackData, address, duration, 'beats');
  }, [playTrack, address]);

  const handlePause = useCallback(() => {
    pauseTrack();
  }, [pauseTrack]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-4">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="font-clash font-semibold text-2xl sm:text-3xl mb-1">Recently Released</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Fresh tracks from the HiBeats community</p>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 italic">Marketplace coming soon</p>
          </div>

          {/* Categories */}
          <div className="mb-6 sm:mb-8">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                    selectedGenre === genre.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Music className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{genre.name}</span>
                  <Badge 
                    variant={selectedGenre === genre.id ? "secondary" : "outline"} 
                    className={`text-[10px] sm:text-xs ${selectedGenre === genre.id ? 'bg-muted' : ''}`}
                  >
                    {genre.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <>
              {/* Mobile/Tablet: Grid Skeleton */}
              <div className="grid grid-cols-2 md:hidden gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <BeatCardSkeleton key={i} />
                ))}
              </div>
              
              {/* Desktop: Grid Skeleton */}
              <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BeatCardSkeletonDesktop key={i} />
                ))}
              </div>
            </>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Failed to load tracks</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Beats List */}
          {!isLoading && !error && (
            <>
              {/* Mobile/Tablet: Grid Layout */}
              <div className="grid grid-cols-2 md:hidden gap-3">
                {beats.map((beat) => (
                  <BeatCard
                    key={beat.id}
                    beat={beat}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlay={handlePlay}
                    onPause={handlePause}
                  />
                ))}
              </div>

              {/* Desktop: Grid Layout (3 columns) */}
              <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {beats.map((beat) => (
                  <BeatCard
                    key={beat.id}
                    beat={beat}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlay={handlePlay}
                    onPause={handlePause}
                  />
                ))}
              </div>

              {beats.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No tracks found</h3>
                  <p className="text-muted-foreground">Try selecting a different genre or check back later for new releases</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Beats;