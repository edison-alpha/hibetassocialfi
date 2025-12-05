// src/hooks/useRecentlyReleased.ts
import { useState, useEffect, useCallback } from 'react';
import { subgraphService } from '@/services/subgraphService';

export interface RecentTrack {
  tokenId: number;
  title: string;
  artist: string;
  artistAddress: string;
  genre: string;
  duration: number;
  ipfsAudioHash: string;
  ipfsArtworkHash: string;
  cover: string;
  audioUrl: string;
  createdAt: number;
  releaseDate: string;
}

export const useRecentlyReleased = (limit: number = 10) => {
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⚡ Memoize loadRecentMusic to prevent unnecessary re-renders
  const loadRecentMusic = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🆕 [Recently Released] Loading recently released music from blockchain...');

      // ⚡ Retry logic for better reliability
      let allNFTs: any[] = [];
      let retries = 3;

      while (retries > 0) {
        try {
          console.log('📀 [Recently Released] Fetching all minted NFTs from subgraph... (attempt', 4 - retries, ')');
          allNFTs = await subgraphService.getAllSongs(1000, 0);

          if (allNFTs && allNFTs.length > 0) {
            console.log(`✅ [Recently Released] Successfully loaded ${allNFTs.length} minted NFTs`);
            break; // Success, exit retry loop
          } else {
            console.warn('⚠️ [Recently Released] No NFTs returned, retrying...', retries - 1, 'attempts left');
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            }
          }
        } catch (nftError) {
          console.error('❌ [Recently Released] Retry failed:', nftError);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          } else {
            throw new Error(`Failed to fetch NFTs from subgraph: ${nftError instanceof Error ? nftError.message : 'Unknown error'}`);
          }
        }
      }

      if (!allNFTs || allNFTs.length === 0) {
        console.log('📭 [Recently Released] No NFTs minted yet');
        setRecentTracks([]);
        setIsLoading(false);
        return;
      }

      // Helper function to format relative time
      const getRelativeTime = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp * 1000; // Convert to milliseconds

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);

        if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
        if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
      };

      // Map NFT data to RecentTrack format
      const tracksWithTimestamp = allNFTs.map(nft => {
        const tokenId = parseInt(nft.id);
        const createdAt = nft.createdAt || Math.floor(Date.now() / 1000);

        // Helper to extract IPFS hash from various formats
        const extractIpfsHash = (hash: string): string => {
          if (!hash) return '';
          // Remove ipfs:// prefix if present
          return hash.replace('ipfs://', '');
        };

        const audioHash = extractIpfsHash(nft.audioHash || '');
        const coverHash = extractIpfsHash(nft.coverHash || '');

        return {
          tokenId,
          title: nft.title || `Track #${tokenId}`,
          artist: nft.artist?.displayName || nft.artist?.username || 'Unknown Artist',
          artistAddress: nft.artist?.id || '',
          genre: nft.genre || 'Unknown',
          duration: nft.duration || 180,
          ipfsAudioHash: audioHash,
          ipfsArtworkHash: coverHash,
          // ✅ Use ipfs.io gateway (consistent with DetailAlbum)
          cover: coverHash
            ? `https://ipfs.io/ipfs/${coverHash}`
            : `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenId}`,
          audioUrl: audioHash
            ? `https://ipfs.io/ipfs/${audioHash}`
            : '',
          createdAt,
          releaseDate: getRelativeTime(createdAt),
        } as RecentTrack;
      });

      // Sort by creation time (descending - newest first) and take top N
      const sortedTracks = tracksWithTimestamp
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);

      console.log(`🆕 [Recently Released] Top ${limit} recently released tracks:`);
      sortedTracks.forEach((track, idx) => {
        console.log(`  ${idx + 1}. ${track.title} - ${track.releaseDate}`);
      });

      setRecentTracks(sortedTracks);

    } catch (err) {
      console.error('❌ [Recently Released] Error loading recent music:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recent music');
      setRecentTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]); // ✅ Add limit as dependency

  useEffect(() => {
    console.log('🔄 [Recently Released] Effect triggered, loading tracks...');
    loadRecentMusic();
  }, [loadRecentMusic]); // ✅ Depend on memoized loadRecentMusic

  return {
    recentTracks,
    isLoading,
    error,
  };
};
