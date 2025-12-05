import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Play,
  Pause,
  Heart,
  Music,
  TrendingUp,
  Clock,
  Users,
  ChevronRight,
  Headphones,
  Disc3,
  DollarSign
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { useAudio } from "@/contexts/AudioContext";

import { useAccount } from "wagmi";
import { recordMusicPlay } from "@/utils/playCountHelper";
import album1 from "@/assets/album1.png";
import album2 from "@/assets/album2.png";
import { Link } from "react-router-dom";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import RightSidebar from "@/components/RightSidebar";
import { profileService } from "@/services/profileService";
import { readContract } from '@wagmi/core';
import { wagmiConfig, CONTRACT_ADDRESSES } from '@/lib/web3-config';
import { USER_PROFILE_ABI } from '@/lib/abis/UserProfile';
import { useTrendingMusic } from '@/hooks/useTrendingMusic';
import { usePlayCounts } from '@/hooks/usePlayCounts';
import { useRecentlyReleased } from '@/hooks/useRecentlyReleased';
import { useAlbums } from '@/hooks/useAlbums';
import { useSequence } from '@/contexts/SequenceContext';
import { subgraphService } from '@/services/subgraphService';
import { toast } from 'sonner';
import { tipService, TipTarget } from '@/services/tipService';

interface ArtistData {
  address: string;
  username: string;
  displayName: string;
  bio: string;
  avatarHash: string;
  isVerified: boolean;
  isArtist: boolean;
  followerCount: number;
}

const Explore = () => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, setPlaylist } = useAudio();
  const { address } = useAccount();
  const [featuredArtists, setFeaturedArtists] = useState<ArtistData[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [followingArtists, setFollowingArtists] = useState<Set<string>>(new Set());
  
  // ✅ Helper function to get IPFS URL (same as DetailAlbum)
  const getIPFSUrl = (hash: string) => {
    if (!hash) return '';
    if (hash.startsWith('http')) return hash;
    const cleanHash = hash.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${cleanHash}`;
  };
  
  // 🔥 Follow functionality (same as UserProfile)
  const { followUser, unfollowUser, smartAccountAddress: sequenceAddress } = useSequence();
  
  // Track recent follow/unfollow actions to prevent auto-refresh from reverting optimistic updates
  const [recentActions, setRecentActions] = useState<Set<string>>(new Set());
  
  // 🔥 Load trending music from blockchain
  const { trendingTracks, isLoading: loadingTrending, error: trendingError } = useTrendingMusic(10);
  
  // 🔥 Use play counts hook for real-time updates
  const tokenIds = trendingTracks.map(t => t.tokenId);
  const { getPlayCount, recordPlay, playCounts } = usePlayCounts(tokenIds);
  
  // 🆕 Load recently released music from blockchain (max 10)
  const { recentTracks, isLoading: loadingRecent, error: recentError } = useRecentlyReleased(10);
  
  // 🆕 Load albums from blockchain
  const { albums, isLoading: loadingAlbums, error: albumsError } = useAlbums(9);
  
  // 🆕 Recently Supported state
  const [recentlySupported, setRecentlySupported] = useState<Array<{
    id: number;
    title: string;
    artist: string;
    cover: string;
    amount: string;
    supporter: string;
    supporterAvatar?: string;
    time: string;
    targetType: TipTarget;
    targetId: number;
  }>>([]);
  const [loadingSupported, setLoadingSupported] = useState(true);
  
  // 🔥 Sort trending tracks by real-time play count (re-sort when play counts change)
  const sortedTrendingTracks = useMemo(() => {
    if (trendingTracks.length === 0) return [];
    
    // Create array with updated play counts
    const tracksWithUpdatedCounts = trendingTracks.map(track => ({
      ...track,
      currentPlayCount: getPlayCount(track.tokenId) || track.playCount
    }));
    
    // Sort by current play count (descending)
    const sorted = tracksWithUpdatedCounts.sort((a, b) => 
      b.currentPlayCount - a.currentPlayCount
    );
    
    console.log('🔄 [Explore] Re-sorted trending tracks:', sorted.map(t => ({
      title: t.title,
      playCount: t.currentPlayCount
    })));
    
    return sorted;
  }, [trendingTracks, playCounts, getPlayCount]);
  
  // Debug log
  useEffect(() => {
    console.log('🔍 [Explore] Trending state:', {
      loading: loadingTrending,
      tracksCount: trendingTracks.length,
      error: trendingError,
      tracks: trendingTracks
    });
  }, [loadingTrending, trendingTracks, trendingError]);
  
  // Helper function to format genre - show only first word + "+" if more attributes
  const formatGenre = (genre: string) => {
    if (!genre) return 'Unknown';
    
    // Split by comma or other separators
    const parts = genre.split(/[,;]/).map(part => part.trim()).filter(Boolean);
    
    if (parts.length === 0) return 'Unknown';
    if (parts.length === 1) {
      // If single part, check if it has multiple words
      const firstPart = parts[0];
      if (!firstPart) return 'Unknown';
      const words = firstPart.split(/\s+/).filter(Boolean);
      const firstWord = words[0];
      return words.length > 1 ? `${firstWord || 'Unknown'} +` : (firstWord || 'Unknown');
    }
    
    // Multiple parts - show first word of first part + "+"
    const firstPart = parts[0];
    if (!firstPart) return 'Unknown';
    const firstWord = firstPart.split(/\s+/)[0];
    return `${firstWord || 'Unknown'} +`;
  };
  // Helper to get album song count
  const getAlbumSongCount = (albumSongs: any[]) => {
    return albumSongs?.length || 0;
  };
  
  // Helper to get album genre (from first song)
  const getAlbumGenre = (albumSongs: any[]) => {
    if (!albumSongs || albumSongs.length === 0) return 'Various';
    const firstSong = albumSongs[0];
    return firstSong?.song?.genre || 'Various';
  };

  // 🎵 Play album - load all songs and start playing
  const handlePlayAlbum = async (album: any) => {
    if (!album.songs || album.songs.length === 0) {
      toast.error('No songs in this album');
      return;
    }

    try {
      console.log('🎵 [Explore] Playing album:', album.title);
      console.log('🎵 [Explore] Album songs data:', JSON.stringify(album.songs, null, 2));
      
      // Helper to clean IPFS hash (remove ipfs:// prefix if present)
      const cleanIpfsHash = (hash: string): string => {
        if (!hash) return '';
        return hash.replace('ipfs://', '').replace('ipfs:', '');
      };

      // Try to use song data directly from album first
      const tracks: any[] = [];
      
      for (const songEntry of album.songs) {
        const song = songEntry.song;
        if (!song) continue;
        
        console.log('🎵 [Explore] Processing song:', song.id, song.title);
        console.log('🎵 [Explore] Song audioHash:', song.audioHash);
        
        // If song has audioHash directly, use it
        if (song.audioHash) {
          const audioHash = cleanIpfsHash(song.audioHash);
          const coverHash = cleanIpfsHash(song.coverHash || album.coverImageHash || '');
          const avatarHash = cleanIpfsHash(song.artist?.avatarHash || album.artist?.avatarHash || '');
          
          tracks.push({
            id: parseInt(song.id),
            title: song.title || `Track #${song.id}`,
            artist: song.artist?.displayName || song.artist?.username || album.artist?.displayName || 'Unknown Artist',
            avatar: avatarHash ? `https://ipfs.io/ipfs/${avatarHash}` : '',
            cover: coverHash ? `https://ipfs.io/ipfs/${coverHash}` : album1,
            genre: song.genre || 'Unknown',
            duration: song.duration || '180',
            audioUrl: audioHash ? `https://ipfs.io/ipfs/${audioHash}` : '',
            likes: 0,
            plays: 0,
          });
        } else {
          // Fallback: fetch full song details from subgraph
          console.log('🎵 [Explore] Fetching full song details for:', song.id);
          try {
            const songDetails = await subgraphService.getSongById(parseInt(song.id));
            if (songDetails && songDetails.audioHash) {
              const audioHash = cleanIpfsHash(songDetails.audioHash);
              const coverHash = cleanIpfsHash(songDetails.coverHash || album.coverImageHash || '');
              const avatarHash = cleanIpfsHash(songDetails.artist?.avatarHash || '');
              
              tracks.push({
                id: parseInt(songDetails.id),
                title: songDetails.title || `Track #${songDetails.id}`,
                artist: songDetails.artist?.displayName || songDetails.artist?.username || 'Unknown Artist',
                avatar: avatarHash ? `https://ipfs.io/ipfs/${avatarHash}` : '',
                cover: coverHash ? `https://ipfs.io/ipfs/${coverHash}` : album1,
                genre: songDetails.genre || 'Unknown',
                duration: songDetails.duration || '180',
                audioUrl: audioHash ? `https://ipfs.io/ipfs/${audioHash}` : '',
                likes: 0,
                plays: 0,
              });
            }
          } catch (err) {
            console.error('🎵 [Explore] Failed to fetch song details:', err);
          }
        }
      }

      console.log('🎵 [Explore] Total tracks created:', tracks.length);
      
      const playableTracks = tracks.filter((t: any) => t && t.audioUrl);
      console.log('🎵 [Explore] Playable tracks:', playableTracks.length);
      
      if (playableTracks.length > 0) {
        console.log('🎵 [Explore] First playable track:', playableTracks[0]);
        setPlaylist(playableTracks);
        playTrack(playableTracks[0] as any);
        toast.success(`Playing ${album.title}`);
      } else {
        toast.error('No playable audio found in this album');
      }
    } catch (error) {
      console.error('Failed to play album:', error);
      toast.error('Failed to load album songs');
    }
  };

  // 👥 Handle follow/unfollow artist (Optimistic update like button)
  const handleFollowArtist = async (artistAddress: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentAddress = sequenceAddress || address;
    if (!currentAddress) {
      toast.error('Please connect your wallet to follow artists');
      return;
    }

    if (artistAddress.toLowerCase() === currentAddress.toLowerCase()) {
      toast.error("You can't follow yourself");
      return;
    }

    const isCurrentlyFollowing = followingArtists.has(artistAddress.toLowerCase());
    const actionType = isCurrentlyFollowing ? 'unfollow' : 'follow';
    const previousFollowerCount = featuredArtists.find(a => a.address.toLowerCase() === artistAddress.toLowerCase())?.followerCount || 0;

    // ⚡ INSTANT OPTIMISTIC UPDATE (like button behavior)
    console.log(`⚡ [Optimistic] ${actionType === 'unfollow' ? 'Unfollowing' : 'Following'} artist:`, artistAddress);
    
    // Mark this artist as having recent action (prevent auto-refresh from reverting)
    setRecentActions(prev => new Set(prev).add(artistAddress.toLowerCase()));
    
    // Clear recent action after 15 seconds (enough time for batch to flush and blockchain to update)
    setTimeout(() => {
      setRecentActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(artistAddress.toLowerCase());
        return newSet;
      });
      console.log('✅ [Optimistic] Cleared recent action for', artistAddress);
    }, 15000);
    
    if (isCurrentlyFollowing) {
      setFollowingArtists(prev => {
        const newSet = new Set(prev);
        newSet.delete(artistAddress.toLowerCase());
        return newSet;
      });
    } else {
      setFollowingArtists(prev => new Set(prev).add(artistAddress.toLowerCase()));
    }

    // Update follower count in UI
    setFeaturedArtists(prev => prev.map(artist => 
      artist.address.toLowerCase() === artistAddress.toLowerCase()
        ? { ...artist, followerCount: artist.followerCount + (isCurrentlyFollowing ? -1 : 1) }
        : artist
    ));

    // 🔥 Execute blockchain transaction in BACKGROUND with BATCH (don't await, don't block UI)
    (async () => {
      try {
        const result = actionType === 'unfollow' 
          ? await unfollowUser(artistAddress)
          : await followUser(artistAddress);
        
        console.log(`✅ [Batch] ${actionType} queued:`, result);
        
        // Send notification for follow (in background)
        if (actionType === 'follow') {
          try {
            const { notificationService } = await import('@/services/notificationService');
            await notificationService.notifyFollow(currentAddress, artistAddress);
            console.log('✅ [Background] Follow notification sent');
          } catch (notifError) {
            console.warn('⚠️ [Background] Failed to send notification:', notifError);
          }
        }
        
        // ✅ Optimistic update is already correct - no need to verify
        // Batch system ensures transaction will succeed
        console.log(`✅ [Optimistic] ${actionType} completed successfully`);
        
      } catch (error) {
        console.error(`❌ [Batch] ${actionType} failed:`, error);
        
        // Revert optimistic update only on error
        setFollowingArtists(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyFollowing) {
            newSet.add(artistAddress.toLowerCase());
          } else {
            newSet.delete(artistAddress.toLowerCase());
          }
          return newSet;
        });
        
        // Revert follower count
        setFeaturedArtists(prev => prev.map(artist => 
          artist.address.toLowerCase() === artistAddress.toLowerCase()
            ? { ...artist, followerCount: previousFollowerCount }
            : artist
        ));
        
        // Show error toast
        toast.error(`Failed to ${actionType} artist. Please try again.`);
      }
    })();
  };

  // 🎵 Play artist's music
  const handlePlayArtistMusic = async (artistAddress: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      toast.loading('Loading artist music...');
      
      // Get songs by artist from subgraph
      const artistSongs = await subgraphService.getSongsByArtist(artistAddress, 20);
      
      if (!artistSongs || artistSongs.length === 0) {
        toast.dismiss();
        toast.info('No music found for this artist');
        return;
      }

      // Helper to clean IPFS hash (remove ipfs:// prefix if present)
      const cleanIpfsHash = (hash: string): string => {
        if (!hash) return '';
        return hash.replace('ipfs://', '').replace('ipfs:', '');
      };

      // Convert to Track format
      const tracks = artistSongs.map((song: any) => {
        const audioHash = cleanIpfsHash(song.audioHash || '');
        const coverHash = cleanIpfsHash(song.coverHash || '');
        const avatarHash = cleanIpfsHash(song.artist?.avatarHash || '');
        
        return {
          id: parseInt(song.id),
          title: song.title || `Track #${song.id}`,
          artist: song.artist?.displayName || song.artist?.username || 'Unknown Artist',
          avatar: avatarHash ? `https://ipfs.io/ipfs/${avatarHash}` : '',
          cover: coverHash ? `https://ipfs.io/ipfs/${coverHash}` : album1,
          genre: song.genre || 'Unknown',
          duration: song.duration || '180',
          audioUrl: audioHash ? `https://ipfs.io/ipfs/${audioHash}` : '',
          likes: 0,
          plays: 0,
        };
      }).filter((t: any) => t.audioUrl);

      toast.dismiss();

      if (tracks.length > 0) {
        const firstTrack = tracks[0];
        if (firstTrack) {
          setPlaylist(tracks);
          playTrack(firstTrack);
          toast.success(`Playing ${tracks.length} songs by artist`);
        } else {
          toast.info('No playable audio found for this artist');
        }
      } else {
        toast.info('No playable audio found for this artist');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Failed to play artist music:', error);
      toast.error('Failed to load artist music');
    }
  };

  const linerNotes = [
    {
      id: 1,
      title: "The Making of Cyber Dreams",
      artist: "Synthwave Collective",
      excerpt: "An intimate look into the creative process behind our latest synthwave masterpiece...",
      readTime: "5 min read",
      cover: album1,
      date: "2 days ago"
    },
    {
      id: 2,
      title: "Exploring AI Music Generation",
      artist: "HiBeats Team",
      excerpt: "How artificial intelligence is revolutionizing music creation and what it means for artists...",
      readTime: "8 min read",
      cover: album2,
      date: "1 week ago"
    }
  ];

  // 🔥 Load recently supported tracks from blockchain
  const loadRecentlySupported = useCallback(async () => {
    try {
      setLoadingSupported(true);
      
      console.log('💰 [Recently Supported] Loading recent tips...');
      
      // ⚡ Retry logic for better reliability
      let recentTips: any[] = [];
      let retries = 3;
      
      while (retries > 0) {
        try {
          recentTips = await tipService.getRecentTips(6);
          
          if (recentTips && recentTips.length > 0) {
            console.log('✅ [Recently Supported] Successfully loaded', recentTips.length, 'tips');
            break; // Success, exit retry loop
          } else {
            console.warn('⚠️ [Recently Supported] No tips returned, retrying...', retries - 1, 'attempts left');
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            }
          }
        } catch (err) {
          console.error('❌ [Recently Supported] Retry failed:', err);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          } else {
            throw err; // Re-throw on last retry
          }
        }
      }
      
      if (recentTips.length === 0) {
        console.log('📭 [Recently Supported] No tips found');
        setRecentlySupported([]);
        setLoadingSupported(false);
        return;
      }
        
        // Enrich tips with profile and track data
        const enrichedTips = await Promise.all(
          recentTips.map(async (tip) => {
            try {
              // Get supporter profile
              const supporterProfile = await profileService.getProfile(tip.from);
              
              // Get target info based on type
              let title = 'Unknown';
              let artist = 'Unknown';
              let cover = album1; // Default cover
              
              if (tip.targetType === TipTarget.TRACK || tip.targetType === TipTarget.ALBUM) {
                // Try to get song/album info from subgraph
                try {
                  if (tip.targetType === TipTarget.TRACK) {
                    const song = await subgraphService.getSongById(tip.targetId.toString());
                    if (song) {
                      title = song.title || 'Unknown Track';
                      // Handle artist which could be string or object
                      let songArtistAddr: string | undefined;
                      if (typeof song.artist === 'string') {
                        songArtistAddr = song.artist;
                      } else if (song.artist && typeof song.artist === 'object') {
                        songArtistAddr = (song.artist as any).id || (song.artist as any).displayName;
                      }
                      if (songArtistAddr && typeof songArtistAddr === 'string') {
                        const songArtistProfile = await profileService.getProfile(songArtistAddr);
                        artist = songArtistProfile?.displayName || songArtistProfile?.username || songArtistAddr.slice(0, 10) + '...';
                      }
                      if (song.coverHash) {
                        cover = `https://ipfs.io/ipfs/${song.coverHash.replace('ipfs://', '')}`;
                      }
                    }
                  } else if (tip.targetType === TipTarget.ALBUM) {
                    const album = await subgraphService.getAlbumById(tip.targetId.toString());
                    if (album) {
                      title = album.title || 'Unknown Album';
                      const artistAddr = typeof album.artist === 'string' ? album.artist : album.artist?.id;
                      const artistProfile = await profileService.getProfile(artistAddr);
                      artist = artistProfile?.displayName || artistProfile?.username || 'Unknown Artist';
                      if (album.coverImageHash) {
                        cover = `https://ipfs.io/ipfs/${album.coverImageHash.replace('ipfs://', '')}`;
                      }
                    }
                  }
                } catch (e) {
                  console.warn('Failed to get target info:', e);
                }
              } else if (tip.targetType === TipTarget.ARTIST) {
                // For artist tips, get artist profile
                const artistProfile = await profileService.getProfile(tip.to);
                title = artistProfile?.displayName || artistProfile?.username || 'Artist';
                artist = 'Artist Support';
                if (artistProfile?.avatarHash) {
                  cover = `https://ipfs.io/ipfs/${artistProfile.avatarHash.replace('ipfs://', '')}`;
                }
              }
              
              // Format time ago
              const timeAgo = formatTimeAgo(tip.timestamp);
              
              return {
                id: tip.id,
                title,
                artist,
                cover,
                amount: tipService.formatTipAmount(tip.amount),
                supporter: supporterProfile?.displayName || supporterProfile?.username || `${tip.from.slice(0, 6)}...${tip.from.slice(-4)}`,
                supporterAvatar: supporterProfile?.avatarHash ? `https://ipfs.io/ipfs/${supporterProfile.avatarHash.replace('ipfs://', '')}` : undefined,
                time: timeAgo,
                targetType: tip.targetType,
                targetId: tip.targetId,
              };
            } catch (e) {
              console.warn('Failed to enrich tip:', e);
              return null;
            }
          })
        );
        
        // Filter out nulls and set state
        const validTips = enrichedTips.filter(t => t !== null) as typeof recentlySupported;
        setRecentlySupported(validTips);
        
      } catch (error) {
        console.error('Failed to load recently supported:', error);
        setRecentlySupported([]);
      } finally {
        setLoadingSupported(false);
      }
  }, []); // ✅ Empty dependency array - only load once
  
  useEffect(() => {
    console.log('🔄 [Recently Supported] Effect triggered, loading tips...');
    loadRecentlySupported();
  }, [loadRecentlySupported]); // ✅ Depend on memoized function

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };


  // Load featured artists (verified artists from blockchain)
  useEffect(() => {
    const loadFeaturedArtists = async () => {
      try {
        setLoadingArtists(true);
        
        // Get verified artists addresses from contract
        const verifiedArtistsAddresses = await readContract(wagmiConfig, {
          address: CONTRACT_ADDRESSES.userProfile as `0x${string}`,
          abi: USER_PROFILE_ABI,
          functionName: 'getVerifiedArtists',
        } as any) as string[];
        
        if (verifiedArtistsAddresses.length === 0) {
          setFeaturedArtists([]);
          setLoadingArtists(false);
          return;
        }
        
        // ⚡ OPTIMIZED: Batch load profiles (5 at a time)
        const addresses = verifiedArtistsAddresses.slice(0, 6);
        const profilesMap = await profileService.getMultipleProfilesBatched(addresses, 5);
        
        const validArtists: ArtistData[] = [];
        for (const address of addresses) {
          const profile = profilesMap.get(address.toLowerCase());
          if (profile && profile.isArtist) {
            validArtists.push({
              address: profile.userAddress,
              username: profile.username || 'Unknown',
              displayName: profile.displayName || 'Unknown Artist',
              bio: profile.bio || 'No bio available',
              avatarHash: profile.avatarHash || '',
              isVerified: profile.isVerified,
              isArtist: profile.isArtist,
              followerCount: profile.followerCount || 0,
            });
          }
        }
        setFeaturedArtists(validArtists);
        
      } catch (error) {
        console.error('❌ Error loading featured artists:', error);
        setFeaturedArtists([]);
      } finally {
        setLoadingArtists(false);
      }
    };
    
    loadFeaturedArtists();
  }, []);

  // Load following status for current user with real-time updates
  useEffect(() => {
    const loadFollowingStatus = async () => {
      const currentAddress = sequenceAddress || address;
      if (!currentAddress || featuredArtists.length === 0) return;
      
      try {
        // Use DataStream V3 service to check follow status (same as UserProfile)
        const { somniaDatastreamServiceV3 } = await import('@/services/somniaDatastreamService.v3');
        
        // Check follow status for each artist
        const followingSet = new Set<string>();
        await Promise.all(
          featuredArtists.map(async (artist) => {
            try {
              // Skip artists with recent actions (preserve optimistic update)
              if (recentActions.has(artist.address.toLowerCase())) {
                console.log('⏭️ [Skip] Preserving optimistic update for', artist.address);
                // Keep current state for this artist
                if (followingArtists.has(artist.address.toLowerCase())) {
                  followingSet.add(artist.address.toLowerCase());
                }
                return;
              }
              
              const isFollowingArtist = await somniaDatastreamServiceV3.isFollowing(currentAddress, artist.address);
              if (isFollowingArtist) {
                followingSet.add(artist.address.toLowerCase());
              }
            } catch (error) {
              console.error('❌ Failed to check follow status for', artist.address, error);
            }
          })
        );
        
        setFollowingArtists(followingSet);
        
      } catch (error) {
        console.error('❌ Failed to load following status:', error);
      }
    };
    
    // Initial load
    loadFollowingStatus();
    
    // Real-time updates: Poll every 10 seconds
    const intervalId = setInterval(() => {
      console.log('🔄 [Explore] Auto-refreshing follow status...');
      loadFollowingStatus();
    }, 10000); // 10 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [sequenceAddress, address, featuredArtists, recentActions, followingArtists]);

  // 🎵 Play artist's music (for Featured Artists section)
  const handlePlayFeaturedArtistMusic = async (artistAddress: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const artistInfo = featuredArtists.find(a => a.address.toLowerCase() === artistAddress.toLowerCase());
    const artistName = artistInfo?.displayName || artistInfo?.username || 'Artist';

    try {
      const toastId = toast.loading('Loading artist music...');
      
      const allSongs = await subgraphService.getAllSongs(1000, 0);
      const artistSongs = allSongs.filter((song: any) => 
        song.artist?.id?.toLowerCase() === artistAddress.toLowerCase()
      );
      
      toast.dismiss(toastId);
      
      if (!artistSongs || artistSongs.length === 0) {
        toast.info(`No music found for ${artistName}`);
        return;
      }

      const cleanIpfsHash = (hash: string): string => {
        if (!hash) return '';
        return hash.replace('ipfs://', '').replace('ipfs:', '');
      };

      const tracks = artistSongs.map((song: any) => {
        const tokenId = parseInt(song.id || song.tokenId || '0');
        const audioHash = cleanIpfsHash(song.audioHash || '');
        const coverHash = cleanIpfsHash(song.coverHash || '');
        const avatarHash = cleanIpfsHash(song.artist?.avatarHash || '');
        const artistAvatarHash = cleanIpfsHash(artistInfo?.avatarHash || '');
        
        return {
          id: tokenId,
          title: song.title || `Track #${tokenId}`,
          artist: song.artist?.displayName || song.artist?.username || artistName,
          avatar: avatarHash 
            ? `https://ipfs.io/ipfs/${avatarHash}`
            : (artistAvatarHash ? `https://ipfs.io/ipfs/${artistAvatarHash}` : ''),
          cover: coverHash 
            ? `https://ipfs.io/ipfs/${coverHash}`
            : album1,
          genre: song.genre || 'Unknown',
          duration: String(song.duration || 180),
          audioUrl: audioHash 
            ? `https://ipfs.io/ipfs/${audioHash}`
            : '',
          likes: song.likeCount || 0,
          plays: song.playCount || 0,
        };
      }).filter((t: any) => t.audioUrl && t.audioUrl.length > 0);

      if (tracks.length > 0) {
        const firstTrack = tracks[0];
        if (firstTrack) {
          setPlaylist(tracks);
          playTrack(firstTrack);
          toast.success(`Playing ${tracks.length} songs by ${artistName}`);
        } else {
          toast.info(`No playable audio found for ${artistName}`);
        }
      } else {
        toast.info(`No playable audio found for ${artistName}`);
      }
    } catch (error) {
      toast.dismiss();
      console.error('❌ Failed to play artist music:', error);
      toast.error('Failed to load artist music');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Main Content */}
      <main className="pt-16 pb-24 md:pb-6">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="space-y-8 md:space-y-12 lg:space-y-16">
            {/* Albums - REAL DATA FROM BLOCKCHAIN */}
            <section>
              <div className="mb-4 md:mb-6 lg:mb-8">
                <h2 className="font-clash font-semibold text-xl md:text-2xl mb-1">Albums & EPs</h2>
                <p className="text-muted-foreground text-xs md:text-sm">Discover albums from our community</p>
              </div>

              {/* Loading State */}
              {loadingAlbums && (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="border-border/20 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl">
                      <div className="w-full h-32 md:h-40 bg-muted animate-pulse" />
                      <CardContent className="p-3 md:p-4">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-3 w-24 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-3 w-20 bg-muted animate-pulse rounded mb-4" />
                        <div className="flex gap-2">
                          <div className="flex-1 h-8 bg-muted animate-pulse rounded-full" />
                          <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Albums from Blockchain */}
              {!loadingAlbums && albums.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {albums.map((album) => {
                    const songCount = getAlbumSongCount(album.songs);
                    const genre = getAlbumGenre(album.songs);
                    // ✅ Use getIPFSUrl helper (same as DetailAlbum)
                    const coverUrl = album.coverImageHash 
                      ? getIPFSUrl(album.coverImageHash)
                      : album1;
                    
                    // Debug log
                    if (album.coverImageHash) {
                      console.log('🖼️ [Album Cover]', {
                        albumId: album.albumId,
                        title: album.title,
                        coverImageHash: album.coverImageHash,
                        coverUrl: coverUrl
                      });
                    }
                    
                    return (
                      <Link key={album.id} to={`/album/${album.albumId}`}>
                        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-transparent overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer">
                          <div className="relative aspect-square overflow-hidden rounded-2xl md:rounded-3xl">
                            {/* Background Image - Full */}
                            <img
                              src={coverUrl}
                              alt={album.title}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                console.error('❌ [Album Cover] Failed to load:', coverUrl);
                                (e.target as HTMLImageElement).src = album1;
                              }}
                            />
                            
                            {/* Gradient Overlay - Bottom to Top */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            
                            {/* Badge - Top Right */}
                            <Badge 
                              variant="secondary" 
                              className="absolute top-2 right-2 md:top-3 md:right-3 text-[10px] md:text-xs rounded-full px-2 md:px-3 py-0.5 md:py-1 bg-black/60 text-white border-0 backdrop-blur-sm"
                            >
                              {album.albumType}
                            </Badge>
                            
                            {/* Content - Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                              {/* Title */}
                              <h3 className="font-semibold text-base md:text-xl mb-1 text-white line-clamp-1">
                                {album.title}
                              </h3>
                              
                              {/* Artist */}
                              <p className="text-white/80 text-xs md:text-sm mb-2 truncate">
                                {album.artist.displayName || album.artist.username}
                              </p>
                              
                              {/* Badges */}
                              <div className="flex items-center gap-1.5 mb-3">
                                <Badge 
                                  variant="secondary" 
                                  className="text-[10px] md:text-xs rounded-full px-2 md:px-2.5 py-0.5 bg-pink-500 text-white border-0"
                                >
                                  {formatGenre(genre)}
                                </Badge>
                                <span className="text-[10px] md:text-xs text-white/70 flex items-center gap-1">
                                  <Music className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                  {album.songCount} {parseInt(album.songCount) === 1 ? 'track' : 'tracks'}
                                </span>
                              </div>
                              
                              {/* Buttons */}
                              <div className="flex gap-1.5 md:gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 rounded-full text-xs md:text-sm h-8 md:h-9"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = `/album/${album.albumId}`;
                                  }}
                                >
                                  <Play className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 fill-current" />
                                  View Album
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-full h-8 md:h-9 w-8 md:w-9 p-0 bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = `/profile/${album.artist.username}`;
                                  }}
                                >
                                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Play Button Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Button
                                size="lg"
                                className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (album.songs && album.songs.length > 0) {
                                    const firstSongEntry = album.songs[0];
                                    const firstSong = firstSongEntry?.song;
                                    if (firstSong) {
                                      const songId = parseInt(firstSong.id);
                                      if (currentTrack?.id === songId && isPlaying) {
                                        pauseTrack();
                                      } else {
                                        handlePlayAlbum(album);
                                      }
                                    } else {
                                      handlePlayAlbum(album);
                                    }
                                  }
                                }}
                              >
                                {currentTrack?.id === parseInt(album.songs?.[0]?.song?.id || '0') && isPlaying ? (
                                  <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                ) : (
                                  <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-0.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Error State */}
              {!loadingAlbums && albumsError && (
                <div className="text-center py-12">
                  <Disc3 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2 text-red-600">Failed to load albums</h3>
                  <p className="text-muted-foreground mb-4">{albumsError}</p>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!loadingAlbums && !albumsError && albums.length === 0 && (
                <div className="text-center py-12">
                  <Disc3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No albums yet</h3>
                  <p className="text-muted-foreground">Create an album to see it here</p>
                </div>
              )}
            </section>

            {/* Liner Notes */}
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
                <div>
                  <h2 className="font-clash font-semibold text-xl md:text-2xl mb-1">Liner Notes</h2>
                  <p className="text-muted-foreground text-xs md:text-sm">Stories and insights from artists</p>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 md:gap-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors text-xs md:text-sm" asChild>
                  <Link to="/liner-notes">
                    <span className="hidden sm:inline">View All</span>
                    <span className="sm:hidden">All</span>
                    <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {linerNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-all duration-300 border-border/20 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <img
                          src={note.cover}
                          alt={note.title}
                          className="w-16 md:w-20 h-16 md:h-20 object-cover rounded-l-xl md:rounded-l-2xl flex-shrink-0"
                        />
                        <div className="flex-1 p-3 md:p-4 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2 line-clamp-2">{note.title}</h3>
                          <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 line-clamp-1 md:line-clamp-2">
                            {note.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
                              <span className="truncate max-w-[100px] md:max-w-none">{note.artist}</span>
                              <span>•</span>
                              <span className="whitespace-nowrap">{note.readTime}</span>
                            </div>
                            <Button size="sm" variant="ghost" className="text-[10px] md:text-xs h-6 md:h-7 px-2 md:px-3 rounded-full flex-shrink-0">
                              Read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recently Supported - REAL DATA FROM BLOCKCHAIN */}
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
                <div>
                  <h2 className="font-clash font-semibold text-xl md:text-2xl mb-1">Recently Supported</h2>
                  <p className="text-muted-foreground text-xs md:text-sm">Tracks that received community support</p>
                </div>
              </div>

              {/* Loading State */}
              {loadingSupported && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/20 bg-card/50 backdrop-blur-sm rounded-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loadingSupported && recentlySupported.length === 0 && (
                <Card className="border-border/20 bg-card/50 backdrop-blur-sm rounded-2xl">
                  <CardContent className="p-8 text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">No recent support activity</p>
                    <p className="text-muted-foreground/70 text-xs mt-1">Be the first to support an artist!</p>
                  </CardContent>
                </Card>
              )}

              {/* Data List */}
              {!loadingSupported && recentlySupported.length > 0 && (
                <div className="space-y-2 md:space-y-3">
                  {recentlySupported.map((support) => (
                    <Card key={support.id} className="hover:shadow-sm transition-all duration-300 border-border/20 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl">
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <img
                            src={support.cover}
                            alt={support.title}
                            loading="lazy"
                            decoding="async"
                            className="w-10 md:w-12 h-10 md:h-12 rounded-lg md:rounded-xl object-cover flex-shrink-0"
                            onError={(e) => {
                              console.error('❌ [Support Cover] Failed to load:', support.cover);
                              (e.target as HTMLImageElement).src = album1;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm">
                              <span className="font-medium">{support.supporter}</span>
                              {" "}supported{" "}
                              <span className="font-medium truncate inline-block max-w-[120px] md:max-w-none align-bottom">{support.title}</span>
                              {support.artist !== 'Artist Support' && (
                                <>
                                  {" "}by{" "}
                                  <span className="text-muted-foreground truncate inline-block max-w-[80px] md:max-w-none align-bottom">{support.artist}</span>
                                </>
                              )}
                            </p>
                            <div className="flex items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2">
                              <Badge variant="secondary" className="text-[10px] md:text-xs rounded-full px-1.5 md:px-2 py-0.5 bg-green-500/10 text-green-500 border-green-500/20">
                                {support.amount}
                              </Badge>
                              <span className="text-[10px] md:text-xs text-muted-foreground">{support.time}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="w-7 md:w-8 h-7 md:h-8 p-0 rounded-full flex-shrink-0">
                            <Heart className="w-3 md:w-4 h-3 md:h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Recently Released - REAL DATA FROM BLOCKCHAIN */}
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
                <div>
                  <h2 className="font-clash font-semibold text-xl md:text-2xl mb-1">Recently Released</h2>
                  <p className="text-muted-foreground text-xs md:text-sm">Fresh tracks from the HiBeats community</p>
                </div>
              </div>

              {/* Loading State */}
              {loadingRecent && (
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <CarouselItem key={i} className="pl-2 md:pl-4 basis-1/2">
                        <Card className="border-border/20 bg-card/50 backdrop-blur-sm rounded-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-muted animate-pulse" />
                              <div className="flex-1">
                                <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
                                <div className="h-3 w-24 bg-muted animate-pulse rounded mb-2" />
                                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                              </div>
                              <div className="w-16 h-8 bg-muted animate-pulse rounded-full" />
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              )}

              {/* Recent Tracks from Blockchain */}
              {!loadingRecent && recentTracks.length > 0 && (
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {recentTracks.map((track) => (
                      <CarouselItem key={track.tokenId} className="pl-2 md:pl-4 basis-full md:basis-1/2">
                        <Card className="hover:shadow-md transition-all duration-300 border-border/20 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl">
                          <CardContent className="p-3 md:p-4">
                            <div className="flex items-center gap-3 md:gap-4">
                              <img
                                src={track.cover}
                                alt={track.title}
                                className="w-12 md:w-14 h-12 md:h-14 rounded-lg md:rounded-xl object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm md:text-base truncate">{track.title}</h3>
                                <p className="text-muted-foreground text-xs md:text-sm truncate">{track.artist}</p>
                                <div className="flex items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2">
                                  <Badge variant="outline" className="text-[10px] md:text-xs rounded-full px-1.5 md:px-2 py-0.5">
                                    {formatGenre(track.genre)}
                                  </Badge>
                                  <span className="text-[10px] md:text-xs text-muted-foreground">
                                    {track.releaseDate}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right ml-2 md:ml-4 flex-shrink-0">
                                <Button
                                  size="sm"
                                  className="rounded-full text-[10px] md:text-xs h-7 md:h-8 px-3 md:px-4 gap-0.5 md:gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (currentTrack?.id === track.tokenId && isPlaying) {
                                      pauseTrack();
                                    } else {
                                      playTrack({
                                        id: track.tokenId,
                                        title: track.title,
                                        artist: track.artist,
                                        cover: track.cover,
                                        audioUrl: track.audioUrl,
                                        duration: track.duration.toString(),
                                        genre: track.genre,
                                        avatar: '',
                                        likes: 0,
                                        plays: 0
                                      });
                                      // Record play event
                                      recordMusicPlay({
                                        id: track.tokenId,
                                        title: track.title,
                                        artist: track.artist,
                                        cover: track.cover,
                                        audioUrl: track.audioUrl,
                                        duration: track.duration.toString(),
                                        genre: track.genre
                                      }, address, track.duration, 'explore');
                                    }
                                  }}
                                >
                                  {currentTrack?.id === track.tokenId && isPlaying ? (
                                    <Pause className="w-2.5 md:w-3 h-2.5 md:h-3" />
                                  ) : (
                                    <Play className="w-2.5 md:w-3 h-2.5 md:h-3" />
                                  )}
                                  <span className="hidden sm:inline">Play</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden lg:flex -left-8" />
                  <CarouselNext className="hidden lg:flex -right-8" />
                </Carousel>
              )}

              {/* Error State */}
              {!loadingRecent && recentError && (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2 text-red-600">Failed to load recent releases</h3>
                  <p className="text-muted-foreground mb-4">{recentError}</p>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!loadingRecent && !recentError && recentTracks.length === 0 && (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No music NFTs yet</h3>
                  <p className="text-muted-foreground">Mint some music NFTs to see them here</p>
                </div>
              )}
            </section>

            {/* What People Are Listening To - REAL DATA FROM BLOCKCHAIN */}
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
                <div>
                  <h2 className="font-clash font-semibold text-xl md:text-2xl mb-1">Trending Now</h2>
                  <p className="text-muted-foreground text-xs md:text-sm">What people are listening to right now</p>
                </div>
                <Link to="/trending">
                  <Button variant="ghost" size="sm" className="gap-1 md:gap-2 hover:bg-muted/50 text-xs md:text-sm">
                    <span className="hidden sm:inline">View Top 100</span>
                    <span className="sm:hidden">Top 100</span>
                    <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                  </Button>
                </Link>
              </div>

              {/* Loading State */}
              {loadingTrending && (
                <div className="space-y-2 md:space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="border-border/20 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl">
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-7 md:w-8 h-7 md:h-8 rounded-full bg-muted animate-pulse" />
                          <div className="w-10 md:w-12 h-10 md:h-12 rounded-lg md:rounded-xl bg-muted animate-pulse" />
                          <div className="flex-1">
                            <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
                            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                          </div>
                          <div className="w-16 h-8 bg-muted animate-pulse rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Trending Tracks from Blockchain */}
              {!loadingTrending && sortedTrendingTracks.length > 0 && (
                <div className="space-y-2 md:space-y-3">
                  {sortedTrendingTracks.map((track, index) => (
                    <Card key={track.tokenId} className="hover:shadow-sm transition-all duration-300 border-border/20 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl">
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center gap-2 md:gap-4">
                          <div className={`flex items-center justify-center w-7 md:w-8 h-7 md:h-8 rounded-full font-semibold text-xs md:text-sm flex-shrink-0 ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                            index === 1 ? 'bg-gray-400/20 text-gray-600' :
                            index === 2 ? 'bg-orange-500/20 text-orange-600' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {index + 1}
                          </div>
                          <img
                            src={track.cover}
                            alt={track.title}
                            loading="lazy"
                            decoding="async"
                            className="w-10 md:w-12 h-10 md:h-12 rounded-lg md:rounded-xl object-cover flex-shrink-0"
                            onError={(e) => {
                              console.error('❌ [Trending Cover] Failed to load:', track.cover);
                              (e.target as HTMLImageElement).src = album1;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm md:text-base truncate">{track.title}</h3>
                            <p className="text-muted-foreground text-xs md:text-sm truncate">{track.artist}</p>
                            <div className="flex items-center gap-1.5 md:gap-2 mt-1 md:mt-2">
                              <Badge variant="secondary" className="text-[10px] md:text-xs rounded-full px-1.5 md:px-2 py-0.5">
                                {formatGenre(track.genre)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-3 ml-2 md:ml-4">
                            <span className="text-[10px] md:text-xs text-green-600 font-medium flex items-center gap-0.5 md:gap-1 whitespace-nowrap">
                              <Headphones className="w-2.5 md:w-3 h-2.5 md:h-3" />
                              <span className="hidden sm:inline">{track.currentPlayCount.toLocaleString()} listening</span>
                              <span className="sm:hidden">{track.currentPlayCount > 999 ? `${(track.currentPlayCount / 1000).toFixed(1)}k` : track.currentPlayCount}</span>
                            </span>
                            <Button
                              size="sm"
                              className="rounded-full text-[10px] md:text-xs h-7 md:h-8 px-3 md:px-4 gap-0.5 md:gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentTrack?.id === track.tokenId && isPlaying) {
                                pauseTrack();
                              } else {
                                playTrack({
                                  id: track.tokenId,
                                  title: track.title,
                                  artist: track.artist,
                                  cover: track.cover,
                                  audioUrl: track.audioUrl,
                                  duration: track.duration.toString(),
                                  genre: track.genre,
                                  avatar: '',
                                  likes: track.likeCount || 0,
                                  plays: track.currentPlayCount
                                });
                                // Record play event with real-time update
                                recordPlay(track.tokenId, track.duration, 'explore');
                              }
                            }}
                          >
                              {currentTrack?.id === track.tokenId && isPlaying ? (
                                <Pause className="w-2.5 md:w-3 h-2.5 md:h-3" />
                              ) : (
                                <Play className="w-2.5 md:w-3 h-2.5 md:h-3" />
                              )}
                              <span className="hidden sm:inline">Play</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Error State */}
              {!loadingTrending && trendingError && (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2 text-red-600">Failed to load trending</h3>
                  <p className="text-muted-foreground mb-4">{trendingError}</p>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!loadingTrending && !trendingError && trendingTracks.length === 0 && (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No music NFTs yet</h3>
                  <p className="text-muted-foreground">Mint some music NFTs to see them trending here</p>
                </div>
              )}
            </section>

            {/* Featured Artists */}
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
                <div>
                  <h2 className="font-clash font-semibold text-xl md:text-2xl mb-1">Featured Artists</h2>
                  <p className="text-muted-foreground text-xs md:text-sm">Discover talented creators in our community</p>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 md:gap-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors text-xs md:text-sm" asChild>
                  <Link to="/featured-artists">
                    <span className="hidden sm:inline">View All</span>
                    <span className="sm:hidden">All</span>
                    <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                  </Link>
                </Button>
              </div>

              {/* Loading State */}
              {loadingArtists && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="border-border/20 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl">
                      <CardContent className="p-4 md:p-5">
                        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                          <div className="w-12 md:w-14 h-12 md:h-14 rounded-full bg-muted animate-pulse" />
                          <div className="flex-1">
                            <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
                            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                        <div className="h-10 md:h-12 bg-muted animate-pulse rounded mb-3 md:mb-4" />
                        <div className="flex gap-2">
                          <div className="flex-1 h-7 md:h-8 bg-muted animate-pulse rounded-full" />
                          <div className="w-7 md:w-8 h-7 md:h-8 bg-muted animate-pulse rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Artists Grid */}
              {!loadingArtists && featuredArtists.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {featuredArtists.map((artist) => (
                    <Link 
                      key={artist.address} 
                      to={`/profile/${artist.username}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-all duration-300 border-border/20 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl h-full">
                        <CardContent className="p-4 md:p-5">
                          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                            <Avatar className="w-12 md:w-14 h-12 md:h-14 flex-shrink-0">
                              {artist.avatarHash ? (
                                <AvatarImage src={`https://ipfs.io/ipfs/${artist.avatarHash}`} />
                              ) : (
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.address}`} />
                              )}
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm md:text-base">
                                {artist.displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                <h3 className="font-semibold text-sm md:text-base truncate">{artist.displayName}</h3>
                                {artist.isVerified && <VerifiedBadge size="sm" />}
                              </div>
                              <p className="text-muted-foreground text-xs md:text-sm truncate">@{artist.username}</p>
                              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{artist.followerCount} followers</p>
                            </div>
                          </div>

                          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2">
                            {artist.bio}
                          </p>

                          <div className="flex gap-1.5 md:gap-2">
                            <Button 
                              size="sm"
                              variant={followingArtists.has(artist.address.toLowerCase()) ? "outline" : "default"}
                              className="flex-1 rounded-full text-[10px] md:text-xs h-7 md:h-8"
                              onClick={(e) => handleFollowArtist(artist.address, e)}
                              disabled={!(sequenceAddress || address) || artist.address.toLowerCase() === (sequenceAddress || address)?.toLowerCase()}
                            >
                              {followingArtists.has(artist.address.toLowerCase()) ? 'Following' : 'Follow'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-full w-7 md:w-8 h-7 md:h-8 p-0 flex-shrink-0"
                              onClick={(e) => handlePlayFeaturedArtistMusic(artist.address, e)}
                            >
                              <Play className="w-2.5 md:w-3 h-2.5 md:h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loadingArtists && featuredArtists.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No featured artists yet</h3>
                  <p className="text-muted-foreground">Check back soon for verified artists in our community</p>
                </div>
              )}
            </section>
              </div>
            </div>

            {/* Right Sidebar */}
            <RightSidebar 
              showTransactions={false}
              showProfile={true}
              showGenres={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Explore;