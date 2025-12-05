import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Play, Pause, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSequence } from "@/contexts/SequenceContext";
import { useCurrentUserProfile } from "@/hooks/useRealTimeProfile";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import DataStreamStatus from "@/components/DataStreamStatus";
import { useTrendingMusic } from "@/hooks/useTrendingMusic";
import { useAudio } from "@/contexts/AudioContext";
import { useFeaturedPlaylists } from "@/hooks/useFeaturedPlaylists";
import { useSuggestedUsers } from "@/hooks/useSuggestedUsers";

interface Transaction {
  txHash: string;
  type: string;
}

interface RightSidebarProps {
  recentTransactions?: Transaction[];
  showTransactions?: boolean;
  showProfile?: boolean;
  showGenres?: boolean;
}

const RightSidebar = ({ 
  recentTransactions = [], 
  showTransactions = true,
  showProfile = true,
  showGenres = true 
}: RightSidebarProps) => {
  const { userProfile } = useAuth();
  const { smartAccountAddress } = useSequence();
  const { profileData: currentUserProfile } = useCurrentUserProfile();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();
  const location = useLocation(); // Detect route changes
  
  // 🔥 Load trending music from blockchain (limit to 5)
  const { trendingTracks, isLoading: loadingTrending, error: trendingError, refresh } = useTrendingMusic(5);
  
  // 🎵 Load featured playlists from blockchain (limit to 4)
  const { playlists: featuredPlaylists, isLoading: loadingPlaylists, error: playlistError, refresh: refreshPlaylists } = useFeaturedPlaylists(4);
  
  // 👥 Load suggested users (limit to 3)
  const { users: suggestedUsers, isLoading: loadingSuggestedUsers, dismissUser } = useSuggestedUsers(3);
  
  // Debug: Log suggested users
  useEffect(() => {
    if (suggestedUsers.length > 0) {
      console.log('👥 [SIDEBAR] Suggested users:', suggestedUsers.map(u => ({
        username: u.username,
        avatarHash: u.avatarHash,
        hasAvatar: !!u.avatarHash
      })));
    }
  }, [suggestedUsers]);

  // 🔍 Debug log for trending tracks state
  useEffect(() => {
    console.log('🔍 [RightSidebar] Trending state updated:', {
      loading: loadingTrending,
      tracksCount: trendingTracks.length,
      error: trendingError,
      tracks: trendingTracks.map(t => ({ title: t.title, plays: t.playCount }))
    });
  }, [trendingTracks, loadingTrending, trendingError]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // 🔄 Refresh trending songs when route changes
  useEffect(() => {
    console.log('🔄 [RightSidebar] Route changed to:', location.pathname);
    console.log('🔄 [RightSidebar] Refreshing trending songs...');
    if (refresh) {
      refresh();
    }
  }, [location.pathname, refresh]); // Trigger on route change

  // 🔄 Set up polling to refresh every 30 seconds
  useEffect(() => {
    if (!refresh) return;
    
    const intervalId = setInterval(() => {
      console.log('🔄 [RightSidebar] Auto-refreshing trending songs (30s interval)');
      refresh();
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refresh]); // Re-setup if refresh changes

  return (
    <div className="hidden lg:block lg:col-span-1">
      <div className="sticky top-20 space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-custom">
        {/* Recent Blockchain Transactions */}
        {showTransactions && recentTransactions.length > 0 && (
          <Card className="border-border/50 bg-transparent">
            <CardContent className="p-4">
              <h3 className="font-medium text-base mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Recent Transactions
              </h3>
              <div className="space-y-2">
                {recentTransactions.slice(0, 3).map((tx) => (
                  <div key={tx.txHash} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>
                        {tx.type === 'post' && '📝'}
                        {tx.type === 'comment' && '💬'}
                        {tx.type === 'like' && '❤️'}
                      </span>
                      <span className="capitalize">{tx.type}</span>
                    </div>
                    <button
                      onClick={() => window.open(`https://shannon-explorer.somnia.network/tx/${tx.txHash}`, '_blank')}
                      className="text-primary hover:text-primary/80 font-mono text-sm"
                    >
                      {tx.txHash.slice(0, 6)}...
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-border/20">
                <div className="text-sm text-muted-foreground text-center">
                  All transactions are gasless via Sequence
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Profile Card */}
        {showProfile && (
          <Card className="border-border/50 bg-transparent relative">
            <div className="absolute top-2 right-2">
              <DataStreamStatus />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={userProfile?.avatar ? (userProfile.avatar.startsWith('http') ? userProfile.avatar : `https://ipfs.io/ipfs/${userProfile.avatar}`) : ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-base">{userProfile?.name || 'Your Profile'}</p>
                    {currentUserProfile?.isVerified && (
                      <VerifiedBadge size="sm" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentUserProfile?.username ? `@${currentUserProfile.username}` : 
                     smartAccountAddress ? 
                       `${smartAccountAddress.slice(0, 6)}...${smartAccountAddress.slice(-4)}` : 
                       '@username'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-base mb-3">
                <div>
                  <span className="font-semibold">{formatNumber(currentUserProfile?.followingCount || 0)}</span>
                  <span className="text-muted-foreground ml-1 text-sm">Following</span>
                </div>
                <div>
                  <span className="font-semibold">{formatNumber(currentUserProfile?.followerCount || 0)}</span>
                  <span className="text-muted-foreground ml-1 text-sm">Followers</span>
                </div>
              </div>
              <Button className="w-full" size="sm" asChild>
                <Link to="/settings">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Music Genres */}
        {showGenres && (
          <Card className="border-border/50 bg-transparent">
            <CardContent className="p-4">
              <h3 className="font-clash font-semibold text-base mb-3">Explore Genres</h3>
              <div className="space-y-2">
                {['Electronic', 'Hip Hop', 'Jazz', 'Ambient', 'Rock', 'Pop'].map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="mr-2 mb-2 cursor-pointer bg-transparent border-white/50 text-foreground hover:bg-muted hover:border-white transition-colors text-sm"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trending Songs - Real Data */}
        <Card className="border-border/50 bg-transparent">
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-clash font-semibold text-base">Trending Songs</h3>
              {/* Subtle loading indicator when refreshing in background */}
              {loadingTrending && trendingTracks.length > 0 && (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
            </div>
            
            {/* Show skeleton only on initial load (no data yet) */}
            {loadingTrending && trendingTracks.length === 0 && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mb-1" />
                      <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="w-8 h-4 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            )}
            
            {/* Trending Tracks - Show immediately if available */}
            {trendingTracks.length > 0 && (
              <div className="space-y-3">
                {trendingTracks.map((track, index) => {
                  // Convert TrendingTrack to Track format for AudioContext
                  const audioTrack = {
                    id: track.tokenId,
                    title: track.title,
                    artist: track.artist,
                    avatar: track.artist.substring(0, 2).toUpperCase(),
                    cover: track.cover,
                    genre: track.genre,
                    duration: `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`,
                    audioUrl: track.audioUrl,
                    likes: track.likeCount,
                    plays: track.playCount
                  };
                  
                  const isCurrentTrack = currentTrack?.id === track.tokenId;
                  
                  return (
                    <div 
                      key={track.tokenId} 
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors group"
                      onClick={() => {
                        if (isCurrentTrack && isPlaying) {
                          pauseTrack();
                        } else {
                          playTrack(audioTrack);
                        }
                      }}
                    >
                      <span className={`text-sm font-semibold w-4 ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-600' :
                        index === 2 ? 'text-orange-600' :
                        'text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{formatNumber(track.playCount)}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrentTrack && isPlaying) {
                              pauseTrack();
                            } else {
                              playTrack(audioTrack);
                            }
                          }}
                        >
                          {isCurrentTrack && isPlaying ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Error State - Only show if no data and error occurred */}
            {!loadingTrending && trendingError && trendingTracks.length === 0 && (
              <div className="text-center py-6">
                <p className="text-red-500 text-base mb-2">Failed to load trending songs</p>
                <p className="text-sm text-muted-foreground">{trendingError}</p>
                {refresh && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3 text-sm"
                    onClick={() => refresh()}
                  >
                    Retry
                  </Button>
                )}
              </div>
            )}
            
            {/* Empty State - Only show if not loading and no data */}
            {!loadingTrending && !trendingError && trendingTracks.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-base">
                No trending songs yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Playlists - Real Data */}
        <Card className="border-border/50 bg-transparent">
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-clash font-semibold text-base">Featured Playlists</h3>
              <Link to="/myplaylist" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            
            {/* Loading State */}
            {loadingPlaylists && featuredPlaylists.length === 0 && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-12 h-12 bg-muted animate-pulse rounded-md" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded mb-1" />
                      <div className="h-3 w-20 bg-muted animate-pulse rounded mb-1" />
                      <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Featured Playlists */}
            {featuredPlaylists.length > 0 && (
              <div className="space-y-3">
                {featuredPlaylists.map((playlist) => (
                  <Link
                    key={playlist.id}
                    to={`/playlist/${playlist.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <img
                      src={playlist.cover}
                      alt={playlist.title}
                      className="w-12 h-12 rounded-md object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base truncate">{playlist.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{playlist.creator}</p>
                      <p className="text-sm text-muted-foreground">{playlist.trackCount} tracks</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Play first track of playlist
                      }}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </Link>
                ))}
              </div>
            )}
            
            {/* Error State */}
            {!loadingPlaylists && playlistError && featuredPlaylists.length === 0 && (
              <div className="text-center py-6">
                <p className="text-red-500 text-base mb-2">Failed to load playlists</p>
                <p className="text-sm text-muted-foreground">{playlistError}</p>
                {refreshPlaylists && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3 text-sm"
                    onClick={() => refreshPlaylists()}
                  >
                    Retry
                  </Button>
                )}
              </div>
            )}
            
            {/* Empty State */}
            {!loadingPlaylists && !playlistError && featuredPlaylists.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-base">
                No public playlists yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Who to Follow */}
        <Card className="border-border/50 bg-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-clash font-semibold text-base">Who to Follow</h3>
            </div>
            
            {/* Loading State */}
            {loadingSuggestedUsers && suggestedUsers.length === 0 && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 bg-muted animate-pulse rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mb-1" />
                      <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="w-16 h-8 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            )}
            
            {/* Suggested Users */}
            {suggestedUsers.length > 0 && (
              <div className="space-y-3">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <Link to={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage 
                          src={user.avatarHash ? `https://ipfs.io/ipfs/${user.avatarHash}` : undefined} 
                          alt={user.displayName}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                          {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="font-semibold text-base truncate">{user.displayName}</h4>
                          {user.isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 px-3 text-sm font-medium hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Follow', user.username);
                        }}
                      >
                        Follow
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          dismissUser(user.id);
                        }}
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {!loadingSuggestedUsers && suggestedUsers.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-base">
                No suggestions available
              </div>
            )}
            
            <Link 
              to="/explore" 
              className="block text-sm text-primary hover:underline mt-3"
            >
              Show more
            </Link>
          </CardContent>
        </Card>

        {/* Footer Links - Twitter Style */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:underline">Terms of Use</Link>
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/cookie-policy" className="hover:underline">Cookie Policy</Link>
            <a href="#" className="hover:underline">Accessibility</a>
            <a href="#" className="hover:underline">Ads info</a>
            <a href="#" className="hover:underline">More</a>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            © 2025 HiBeats.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
