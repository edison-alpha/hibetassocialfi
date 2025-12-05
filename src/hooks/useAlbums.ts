// Hook to fetch albums from subgraph
import { useState, useEffect, useCallback } from 'react';
import { subgraphService } from '@/services/subgraphService';

interface Album {
  id: string;
  albumId: string;
  title: string;
  description?: string;
  coverImageHash: string;
  albumType: 'SINGLE' | 'EP' | 'ALBUM';
  songCount: string;
  createdAt: string;
  isPublished?: boolean; // Optional for backward compatibility
  artist: {
    id: string;
    username: string;
    displayName: string;
    avatarHash?: string;
  };
  songs: Array<{
    song: {
      id: string;
      tokenId?: string;
      title: string;
      genre: string;
      duration: string;
      audioHash?: string;
      coverHash?: string;
      artist?: {
        id: string;
        username: string;
        displayName: string;
        avatarHash?: string;
      };
    };
  }>;
}

export const useAlbums = (limit: number = 20) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⚡ Memoize loadAlbums to prevent unnecessary re-renders
  const loadAlbums = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 [useAlbums] Loading albums from subgraph (limit:', limit, ')');

      // ⚡ Retry logic for better reliability
      let allAlbums: any[] = [];
      let retries = 3;
      
      while (retries > 0) {
        try {
          allAlbums = await subgraphService.getAllAlbums(limit, 0);
          
          if (allAlbums && allAlbums.length > 0) {
            console.log('✅ [useAlbums] Successfully loaded albums:', allAlbums.length);
            break; // Success, exit retry loop
          } else {
            console.warn('⚠️ [useAlbums] No albums returned, retrying...', retries - 1, 'attempts left');
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            }
          }
        } catch (err) {
          console.error('❌ [useAlbums] Retry failed:', err);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          } else {
            throw err; // Re-throw on last retry
          }
        }
      }

      console.log('📀 [useAlbums] Found albums from subgraph:', allAlbums.length);

      if (allAlbums.length === 0) {
        setAlbums([]);
        setIsLoading(false);
        return;
      }

      // Filter only published albums for public view
      // If isPublished field doesn't exist (undefined), show the album (backward compatibility)
      const publishedAlbums = allAlbums.filter(album => {
        // If isPublished is undefined, show it (backward compatibility)
        if (album.isPublished === undefined) {
          console.log('⚠️ [useAlbums] Album has no isPublished field:', album.albumId, '- showing it');
          return true;
        }
        // Otherwise, only show if published
        return album.isPublished === true;
      });
      
      console.log('📀 [useAlbums] Published albums:', publishedAlbums.length, 'of', allAlbums.length);
      console.log('📀 [useAlbums] Sample album data:', allAlbums[0]);

      // Map subgraph data to Album format
      const loadedAlbums: Album[] = publishedAlbums.map(album => ({
        id: album.id,
        albumId: album.albumId,
        title: album.title || `Album #${album.albumId}`,
        description: album.description,
        coverImageHash: album.coverImageHash,
        albumType: album.albumType,
        songCount: album.songCount,
        createdAt: album.createdAt,
        isPublished: album.isPublished !== undefined ? album.isPublished : true, // Default to true if undefined
        artist: album.artist,
        songs: album.songs || []
      }));
      
      console.log('✅ [useAlbums] Loaded albums:', loadedAlbums.length);
      setAlbums(loadedAlbums);
    } catch (error) {
      console.error('❌ [useAlbums] Failed to load albums:', error);
      setError(error instanceof Error ? error.message : 'Failed to load albums');
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]); // ✅ Add limit as dependency

  useEffect(() => {
    console.log('🔄 [useAlbums] Effect triggered, loading albums...');
    loadAlbums();
  }, [loadAlbums]); // ✅ Depend on memoized loadAlbums

  return {
    albums,
    isLoading,
    error,
    refetch: loadAlbums
  };
};
