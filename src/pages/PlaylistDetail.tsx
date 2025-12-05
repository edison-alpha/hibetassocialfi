import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Plus,
  Share2,
  Edit,
  Trash2,
  Music,
  ArrowLeft,
  MoreHorizontal,
  User,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Navbar from '@/components/Navbar';
import EditPlaylistModal from '@/components/EditPlaylistModal';
import AddTrackToPlaylistModal from '@/components/AddTrackToPlaylistModal';
import SharePlaylistModal from '@/components/SharePlaylistModal';
import { useAudio } from '@/contexts/AudioContext';
import { useAccount } from 'wagmi';
import { recordMusicPlay } from '@/utils/playCountHelper';
import { usePlaylists } from '@/hooks/usePlaylists';
import { usePlaylistTracks } from '@/hooks/usePlaylistInteractions';
import { playlistService } from '@/services/playlistService';
import { toast } from 'sonner';
import album1 from '@/assets/album1.png';

export default function PlaylistDetail() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTrackModalOpen, setIsAddTrackModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // ✅ NEW: State for playlist (can be from any user)
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  
  const {
    updatePlaylist,
    deletePlaylist,
    refreshPlaylists
  } = usePlaylists();

  // ✅ Use new hook for track management (like useSongLike pattern)
  const {
    trackIds,
    isLoading: isLoadingTracksHook,
    addTrack,
    removeTrack,
  } = usePlaylistTracks(playlistId || '');

  // ✅ NEW: Load playlist from blockchain (works for any user's playlist)
  useEffect(() => {
    const loadPlaylist = async () => {
      if (!playlistId) return;

      setIsLoadingPlaylist(true);
      try {
        console.log(`🔍 [PLAYLIST-DETAIL] Loading playlist ${playlistId.slice(0, 10)}...`);
        const loadedPlaylist = await playlistService.getPlaylistById(playlistId);
        
        if (loadedPlaylist) {
          setPlaylist(loadedPlaylist);
          console.log(`✅ [PLAYLIST-DETAIL] Playlist loaded:`, {
            id: loadedPlaylist.id.slice(0, 10) + '...',
            title: loadedPlaylist.title,
            owner: loadedPlaylist.owner.slice(0, 10) + '...',
            isOwner: loadedPlaylist.owner.toLowerCase() === address?.toLowerCase(),
            trackCount: loadedPlaylist.trackIds.length
          });
        } else {
          console.warn(`⚠️ [PLAYLIST-DETAIL] Playlist not found`);
          setPlaylist(null);
        }
      } catch (error) {
        console.error('❌ [PLAYLIST-DETAIL] Failed to load playlist:', error);
        setPlaylist(null);
      } finally {
        setIsLoadingPlaylist(false);
      }
    };

    loadPlaylist();
  }, [playlistId, address]);

  // State for loaded tracks
  const [loadedTracks, setLoadedTracks] = useState<any[]>([]);
  const [isLoadingTrackDetails, setIsLoadingTrackDetails] = useState(false);

  // Load track details from subgraph (using trackIds from hook)
  const loadTrackDetails = useCallback(async () => {
    if (!trackIds || trackIds.length === 0) {
      console.log('📋 [PLAYLIST-DETAIL] No tracks to load');
      setLoadedTracks([]);
      return;
    }

    setIsLoadingTrackDetails(true);
    try {
      console.log(`🎵 [PLAYLIST-DETAIL] Loading ${trackIds.length} track details:`, trackIds);
      const { subgraphService } = await import('@/services/subgraphService');
      const { getIpfsUrl } = await import('@/lib/ipfs');
      
      // ✅ Load ALL songs from subgraph (like AddTrackModal does)
      console.log('  📥 [PLAYLIST-DETAIL] Loading all songs from subgraph...');
      const allSongs = await subgraphService.getAllSongs(1000, 0);
      console.log(`  ✅ [PLAYLIST-DETAIL] Loaded ${allSongs.length} songs from subgraph`);
      
      // ✅ Filter to only tracks in this playlist
      const tracks = trackIds.map((trackId) => {
        const song = allSongs.find(s => s.id === trackId);
        
        if (song) {
          const coverUrl = getIpfsUrl(song.coverHash || '');
          const audioUrl = getIpfsUrl(song.audioHash || '');
          
          console.log(`  ✅ [PLAYLIST-DETAIL] Found track ${trackId}:`, {
            title: song.title,
            artist: song.artist?.displayName || song.artist?.username,
            genre: song.genre,
            duration: song.duration,
            coverHash: song.coverHash,
            audioHash: song.audioHash,
            coverUrl: coverUrl.slice(0, 50) + '...',
            audioUrl: audioUrl.slice(0, 50) + '...',
            hasAudio: !!song.audioHash,
            hasCover: !!song.coverHash
          });
          
          return {
            id: trackId,
            title: song.title || `Track #${trackId}`,
            artist: song.artist?.displayName || song.artist?.username || 'Unknown Artist',
            duration: formatDuration(Number(song.duration) || 180),
            genre: song.genre || 'Unknown',
            cover: coverUrl || album1,
            audioUrl: audioUrl,
          };
        } else {
          console.warn(`  ⚠️ [PLAYLIST-DETAIL] Track ${trackId} not found in subgraph`);
          // Fallback if track not found
          return {
            id: trackId,
            title: `Track #${trackId}`,
            artist: 'Unknown Artist',
            duration: '0:00',
            genre: 'Unknown',
            cover: album1,
            audioUrl: '',
          };
        }
      });

      setLoadedTracks(tracks);
      console.log(`✅ [PLAYLIST-DETAIL] Loaded ${tracks.length} track details successfully`);
      
      // Debug: Show which tracks have audio
      const tracksWithAudio = tracks.filter(t => t.audioUrl);
      const tracksWithoutAudio = tracks.filter(t => !t.audioUrl);
      console.log(`  🎵 Tracks with audio: ${tracksWithAudio.length}`);
      console.log(`  ⚠️  Tracks without audio: ${tracksWithoutAudio.length}`);
      if (tracksWithoutAudio.length > 0) {
        console.log(`  Missing audio for:`, tracksWithoutAudio.map(t => t.id));
      }
    } catch (error) {
      console.error('❌ [PLAYLIST-DETAIL] Failed to load track details:', error);
      setLoadedTracks([]);
    } finally {
      setIsLoadingTrackDetails(false);
    }
  }, [trackIds]);

  // Auto-reload track details when trackIds change
  useEffect(() => {
    loadTrackDetails();
  }, [loadTrackDetails]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert playlist to display format (using trackIds from hook)
  const playlistData = playlist ? {
    id: playlist.id,
    title: playlist.title,
    description: playlist.description,
    cover: playlist.coverHash 
      ? `https://gateway.pinata.cloud/ipfs/${playlist.coverHash.replace('ipfs://', '')}`
      : album1,
    tracks: loadedTracks,
    trackIds: trackIds, // ✅ Use trackIds from hook (real-time)
    createdAt: new Date(playlist.timestamp).toLocaleDateString(),
    isPublic: playlist.isPublic,
    likes: 0,
    plays: 0,
    trackCount: trackIds.length // ✅ Use trackIds from hook
  } : null;

  const handleEditPlaylist = async (updates: {
    title?: string;
    description?: string;
    coverHash?: string;
  }) => {
    if (!playlist) return;

    try {
      const playlistUpdates: any = {};
      if (updates.title) playlistUpdates.title = updates.title;
      if (updates.description !== undefined) playlistUpdates.description = updates.description;
      if (updates.coverHash) playlistUpdates.coverHash = updates.coverHash;

      if (Object.keys(playlistUpdates).length === 0) {
        toast.info('No changes to save');
        return;
      }

      toast.info('Updating playlist on blockchain...');
      await updatePlaylist(playlist.id, playlistUpdates);
      await refreshPlaylists();
      toast.success('Playlist updated on blockchain!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update playlist:', error);
      toast.error('Failed to update playlist');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      toast.info('Deleting playlist on blockchain...');
      const success = await deletePlaylist(playlist.id);
      if (success) {
        toast.success('Playlist deleted on blockchain!');
        navigate('/my-playlist');
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  const handleTogglePrivacy = async () => {
    if (!playlist) return;
    
    try {
      toast.info('Updating privacy on blockchain...');
      const success = await updatePlaylist(playlist.id, { isPublic: !playlist.isPublic });
      if (success) {
        await refreshPlaylists();
        toast.success(`Playlist is now ${!playlist.isPublic ? 'public' : 'private'} on blockchain!`);
      }
    } catch (error) {
      console.error('Failed to update privacy:', error);
      toast.error('Failed to update privacy');
    }
  };

  // ✅ Use hook methods (like toggleLike pattern)
  const handleAddTrack = async (trackId: string): Promise<boolean> => {
    if (!playlist) return false;
    
    console.log(`➕ [PLAYLIST-DETAIL] Adding track ${trackId} to playlist`);
    
    // Use hook method (handles optimistic update + wallet client)
    const success = await addTrack(trackId);
    
    if (success) {
      console.log(`✅ [PLAYLIST-DETAIL] Track added, reloading track details...`);
      
      // Small delay to ensure trackIds state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force reload track details with new trackIds
      await loadTrackDetails();
      
      // Refresh playlist list in background
      refreshPlaylists();
    }
    
    return success;
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlist) return;
    if (!confirm('Remove this track from playlist?')) return;
    
    console.log(`➖ [PLAYLIST-DETAIL] Removing track ${trackId} from playlist`);
    
    // Use hook method (handles optimistic update + wallet client)
    const success = await removeTrack(trackId);
    
    if (success) {
      console.log(`✅ [PLAYLIST-DETAIL] Track removed, reloading track details...`);
      
      // Small delay to ensure trackIds state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force reload track details with updated trackIds
      await loadTrackDetails();
      
      // Refresh playlist list in background
      refreshPlaylists();
    }
  };

  const handlePlayTrack = (track: any) => {
    console.log('🎵 [PLAYLIST-DETAIL] Play track clicked:', {
      id: track.id,
      title: track.title,
      artist: track.artist,
      hasAudioUrl: !!track.audioUrl,
      audioUrl: track.audioUrl?.slice(0, 50) + '...',
      cover: track.cover?.slice(0, 50) + '...'
    });

    // ✅ Validate track has audio
    if (!track.audioUrl) {
      console.error('❌ [PLAYLIST-DETAIL] Track has no audio URL:', track);
      toast.error('This track has no audio file');
      return;
    }

    const trackIdStr = String(track.id);
    const currentTrackIdStr = currentTrack?.id ? String(currentTrack.id) : '';
    
    if (currentTrackIdStr === trackIdStr && isPlaying) {
      console.log('⏸️ [PLAYLIST-DETAIL] Pausing current track');
      pauseTrack();
    } else {
      console.log('▶️ [PLAYLIST-DETAIL] Playing track:', track.title);
      
      // ✅ Ensure track has all required fields for audio player
      const trackToPlay = {
        ...track,
        // Ensure numeric ID for comparison
        id: track.id,
        // Ensure audioUrl is set
        audioUrl: track.audioUrl,
        // Ensure cover is set
        cover: track.cover || album1,
      };
      
      playTrack(trackToPlay);
      
      // Record play count
      const duration = typeof track.duration === 'string' 
        ? parseInt(track.duration.split(':')[0]) * 60 + parseInt(track.duration.split(':')[1] || '0')
        : track.duration || 180;
      recordMusicPlay(trackToPlay, address, duration, 'playlist');
      
      console.log('✅ [PLAYLIST-DETAIL] Track playing');
    }
  };

  // ✅ Play all tracks in playlist
  const handlePlayAll = () => {
    if (!playlistData || playlistData.tracks.length === 0) {
      toast.info('No tracks to play');
      return;
    }

    // Filter tracks with audio
    const playableTracks = playlistData.tracks.filter(t => t.audioUrl);
    
    if (playableTracks.length === 0) {
      toast.error('No playable tracks in this playlist');
      return;
    }

    console.log(`▶️ [PLAYLIST-DETAIL] Playing all tracks (${playableTracks.length} tracks)`);
    
    // Play first track
    handlePlayTrack(playableTracks[0]);
    
    toast.success(`Playing ${playableTracks.length} tracks`);
  };

  // ✅ Check if user is owner
  const isOwner = playlist && address && playlist.owner.toLowerCase() === address.toLowerCase();

  if (isLoadingPlaylist) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <main className="pt-16">
          <div className="container mx-auto px-6 py-12">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading playlist...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!playlistData) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <main className="pt-16">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center py-12">
              <Music className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Playlist not found</h3>
              <p className="text-gray-400 mb-4">This playlist doesn't exist or has been deleted</p>
              <Button onClick={() => navigate('/myplaylist')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to My Playlists
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="pt-16">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/myplaylist')}
            className="mb-4 md:mb-8 gap-1 md:gap-2 text-gray-400 hover:text-white hover:bg-white/5 -ml-2 text-xs md:text-sm h-8 md:h-10"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            Back
          </Button>

          {/* Playlist Header */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-8 md:mb-12">
            {/* Cover Image */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-lg md:rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex-shrink-0 shadow-2xl mx-auto md:mx-0">
              <img
                src={playlistData.cover}
                alt={playlistData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = album1;
                }}
              />
            </div>

            {/* Playlist Info */}
            <div className="flex-1 flex flex-col justify-end text-center md:text-left">
              <div className="space-y-2 md:space-y-4">
                <Badge 
                  variant={playlistData.isPublic ? "default" : "secondary"} 
                  className="w-fit text-[10px] md:text-xs font-medium mx-auto md:mx-0"
                >
                  {playlistData.isPublic ? "Public" : "Private"}
                </Badge>
                
                <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-white leading-tight">
                  {playlistData.title}
                </h1>
                
                {playlistData.description && (
                  <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-2xl">
                    {playlistData.description}
                  </p>
                )}
                
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-gray-400">
                  <span className="font-medium text-white">HiBeats</span>
                  <span>•</span>
                  <span>{playlistData.tracks.length} songs</span>
                </div>
              </div>
            </div>

            {/* Actions Menu - Only show for owner */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-8 h-8 md:w-10 md:h-10 p-0 text-gray-400 hover:text-white hover:bg-white/5 self-start absolute top-0 right-0 md:relative"
                  >
                    <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
                  <DropdownMenuItem 
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleTogglePrivacy}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {playlistData.isPublic ? 'Make Private' : 'Make Public'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={handleDeletePlaylist}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-800 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Playlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-2 md:gap-4 mb-6 md:mb-8">
            <Button 
              size="lg" 
              onClick={handlePlayAll}
              disabled={!playlistData || playlistData.tracks.length === 0}
              className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-white hover:bg-gray-100 hover:scale-105 transition-all shadow-lg p-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 md:w-6 md:h-6 text-black ml-0.5 md:ml-1" fill="currentColor" />
            </Button>
            
            {/* Only show Add Track button for owner */}
            {isOwner && (
              <Button 
                size="sm"
                variant="ghost" 
                className="gap-1 md:gap-2 text-gray-300 hover:text-white hover:bg-white/5 text-xs md:text-sm h-9 md:h-10 px-3 md:px-4"
                onClick={() => setIsAddTrackModalOpen(true)}
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Add Track</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
            
            <Button 
              size="sm"
              variant="ghost" 
              className="gap-1 md:gap-2 text-gray-300 hover:text-white hover:bg-white/5 text-xs md:text-sm h-9 md:h-10 px-3 md:px-4"
              onClick={() => setIsShareModalOpen(true)}
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          {/* Track List */}
          <div className="space-y-1 bg-black/20 rounded-lg md:rounded-xl p-2 md:p-4">
              {/* Table Header - Hidden on mobile */}
              <div className="hidden sm:grid grid-cols-[40px_1fr_200px_100px_60px] gap-4 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-white/5">
                <div className="text-center">#</div>
                <div>Title</div>
                <div className="hidden md:block">Genre</div>
                <div className="text-right hidden sm:block">Duration</div>
                <div></div>
              </div>
            
              {(isLoadingTracksHook || isLoadingTrackDetails) ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span className="ml-3 text-gray-400">Loading tracks...</span>
                </div>
              ) : playlistData.tracks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                    <Music className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-lg mb-6">No tracks yet</p>
                  <Button 
                    variant="outline" 
                    className="gap-2 border-gray-700 text-gray-300 hover:text-white hover:bg-white/5" 
                    onClick={() => setIsAddTrackModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Track
                  </Button>
                </div>
              ) : (
                playlistData.tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[40px_1fr_200px_100px_60px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-white/5 transition-all duration-200"
                  >
                    {/* Track Number / Play Button */}
                    <div className="flex items-center justify-center">
                      <span className="text-gray-500 group-hover:hidden text-xs sm:text-sm font-medium">
                        {index + 1}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hidden group-hover:flex w-7 h-7 sm:w-8 sm:h-8 p-0 text-white hover:bg-white/10 hover:scale-110 transition-all"
                        onClick={() => handlePlayTrack(track)}
                      >
                        {String(currentTrack?.id) === String(track.id) && isPlaying ? (
                          <Pause className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
                        ) : (
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" fill="currentColor" />
                        )}
                      </Button>
                    </div>

                    {/* Title & Artist */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0 shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = album1;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-white truncate text-sm sm:text-base">
                          {track.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">
                          {track.artist}
                        </p>
                        {/* Show genre on mobile below artist */}
                        <p className="text-[10px] text-gray-500 truncate sm:hidden mt-0.5">
                          {track.genre} • {track.duration}
                        </p>
                      </div>
                    </div>

                    {/* Genre - Desktop only */}
                    <div className="hidden md:flex items-center">
                      <span className="text-sm text-gray-400 truncate">
                        {track.genre}
                      </span>
                    </div>

                    {/* Duration - Tablet+ */}
                    <div className="hidden sm:flex items-center justify-end">
                      <span className="text-sm text-gray-400">
                        {track.duration}
                      </span>
                    </div>

                    {/* Actions - Only show remove button for owner */}
                    <div className="flex items-center justify-end">
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-gray-500 hover:text-red-400 hover:bg-white/5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleRemoveTrack(track.id)}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
          </div>
        </div>
      </main>

      {/* Edit Playlist Modal - Only for owner */}
      {playlist && isOwner && (
        <EditPlaylistModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditPlaylist}
          playlist={{
            id: playlist.id,
            title: playlist.title,
            description: playlist.description,
            cover: playlistData?.cover || ''
          }}
        />
      )}

      {/* Add Track Modal - Only for owner */}
      {playlist && isOwner && (
        <AddTrackToPlaylistModal
          isOpen={isAddTrackModalOpen}
          onClose={() => setIsAddTrackModalOpen(false)}
          onAddTrack={handleAddTrack}
          existingTrackIds={trackIds}
        />
      )}

      {/* Share Playlist Modal - Available for everyone */}
      {playlist && (
        <SharePlaylistModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          playlist={{
            id: playlist.id,
            title: playlist.title,
            description: playlist.description
          }}
        />
      )}
    </div>
  );
}
