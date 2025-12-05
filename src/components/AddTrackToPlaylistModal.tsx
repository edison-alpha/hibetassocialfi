import { useState, useEffect } from 'react';
import { Search, Music, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyMusic } from '@/hooks/useMyMusic';
import { useOwnedNFTs } from '@/hooks/useOwnedNFTs';
import { subgraphService } from '@/services/subgraphService';
import { getIpfsUrl } from '@/lib/ipfs';

interface AddTrackToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (trackId: string) => Promise<boolean>;
  existingTrackIds: string[];
}

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  genre: string;
  isOwned?: boolean;
}

export default function AddTrackToPlaylistModal({
  isOpen,
  onClose,
  onAddTrack,
  existingTrackIds
}: AddTrackToPlaylistModalProps) {
  const [activeTab, setActiveTab] = useState<'owned' | 'global'>('owned');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [globalTracks, setGlobalTracks] = useState<Track[]>([]);
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);

  // Helper function to format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load owned music
  const { songs: ownedSongs, isLoading: isLoadingOwned } = useMyMusic();
  const { ownedNFTs, isLoading: isLoadingNFTs } = useOwnedNFTs();

  // Convert owned songs to Track format
  const ownedTracks: Track[] = [
    ...ownedSongs.map(song => ({
      id: song.tokenId.toString(),
      title: song.title,
      artist: song.artist,
      cover: song.imageUrl,
      duration: formatDuration(song.duration),
      genre: song.genre,
      isOwned: true
    })),
    ...ownedNFTs.singles.map(nft => ({
      id: nft.tokenId,
      title: nft.title,
      artist: nft.artist,
      cover: nft.imageUrl,
      duration: formatDuration(nft.duration),
      genre: nft.genre,
      isOwned: true
    }))
  ];

  // Load global music when switching to global tab
  useEffect(() => {
    if (activeTab === 'global' && globalTracks.length === 0) {
      loadGlobalMusic();
    }
  }, [activeTab]);

  const loadGlobalMusic = async () => {
    setIsLoadingGlobal(true);
    try {
      console.log('🌍 [AddTrack] Loading global music...');
      
      // Load from subgraph
      const songs = await subgraphService.getAllSongs(100, 0);
      
      const tracks: Track[] = songs.map(song => ({
        id: song.id,
        title: song.title || `Track #${song.id}`,
        artist: song.artist?.displayName || song.artist?.username || 'Unknown Artist',
        cover: getIpfsUrl(song.coverHash || ''),
        duration: formatDuration(Number(song.duration) || 180),
        genre: song.genre || 'Unknown',
        isOwned: false
      }));
      
      setGlobalTracks(tracks);
      console.log(`✅ [AddTrack] Loaded ${tracks.length} global tracks`);
    } catch (error) {
      console.error('❌ [AddTrack] Failed to load global music:', error);
      toast.error('Failed to load global music');
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const handleAddTrack = async (trackId: string) => {
    if (existingTrackIds.includes(trackId)) {
      toast.info('Track already in playlist');
      return;
    }

    setAddingTrackId(trackId);
    try {
      console.log(`➕ [ADD-TRACK-MODAL] Adding track ${trackId}...`);
      const success = await onAddTrack(trackId);
      if (success) {
        console.log(`✅ [ADD-TRACK-MODAL] Track ${trackId} added successfully`);
        toast.success('Track added to playlist!');
        // Don't close modal automatically - let user add more tracks
        // User can close manually when done
      } else {
        console.error(`❌ [ADD-TRACK-MODAL] Failed to add track ${trackId}`);
        toast.error('Failed to add track to playlist');
      }
    } catch (error) {
      console.error('❌ [ADD-TRACK-MODAL] Error adding track:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add track: ${errorMessage}`);
    } finally {
      setAddingTrackId(null);
    }
  };

  // Filter tracks based on search
  const currentTracks = activeTab === 'owned' ? ownedTracks : globalTracks;
  const filteredTracks = currentTracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = activeTab === 'owned' 
    ? (isLoadingOwned || isLoadingNFTs)
    : isLoadingGlobal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Add Track to Playlist
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTab === 'owned' ? 'From your collection' : 'From global library'}
          </p>
        </DialogHeader>

        {/* Tabs & Search */}
        <div className="px-6 pt-4 pb-4 space-y-4 flex-shrink-0">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'owned' | 'global')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="owned"
                className="gap-2"
              >
                <Music className="w-4 h-4" />
                My Music
              </TabsTrigger>
              <TabsTrigger 
                value="global"
                className="gap-2"
              >
                <Music className="w-4 h-4" />
                Global
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Track List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Loading tracks...</p>
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Music className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'No tracks found' : 'No tracks available'}
                </p>
                {searchQuery && (
                  <p className="text-muted-foreground text-xs mt-2">
                    Try a different search term
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTracks.map((track) => {
                  const isInPlaylist = existingTrackIds.includes(track.id);
                  const isAdding = addingTrackId === track.id;

                  return (
                    <div
                      key={track.id}
                      className={`group flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isInPlaylist
                          ? 'opacity-50 bg-muted/50'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {/* Cover */}
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{track.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{track.genre}</p>
                      </div>

                      {/* Duration */}
                      <span className="text-xs text-muted-foreground hidden sm:block">{track.duration}</span>

                      {/* Add Button */}
                      <Button
                        onClick={() => handleAddTrack(track.id)}
                        disabled={isInPlaylist || isAdding}
                        size="sm"
                        className={`rounded-full px-4 h-8 text-xs font-medium ${
                          isInPlaylist 
                            ? 'bg-white text-black hover:bg-white cursor-not-allowed opacity-60' 
                            : ''
                        }`}
                        variant={isInPlaylist ? "ghost" : "default"}
                      >
                        {isAdding ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isInPlaylist ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Added
                          </>
                        ) : (
                          'Add'
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        {/* Footer */}
        <div className="p-6 pt-4 flex-shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
