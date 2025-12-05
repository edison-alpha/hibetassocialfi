// Optimized hook for beats page with caching and pagination
import { useState, useMemo } from 'react';
import { useAlbums } from './useAlbums';

// Helper function to extract main genre from genre string
const extractMainGenre = (genreString: string): string => {
  if (!genreString || genreString === 'Unknown') return 'Unknown';
  
  const knownGenres = [
    'Pop', 'Rock', 'Jazz', 'Metal', 'Hip Hop', 'Hip-Hop', 'R&B', 'RnB',
    'Electronic', 'Dance', 'Classical', 'Country', 'Blues', 'Reggae',
    'Folk', 'Soul', 'Funk', 'Disco', 'House', 'Techno', 'Ambient',
    'Indie', 'Alternative', 'Punk', 'Grunge', 'Gospel', 'Latin',
    'K-Pop', 'J-Pop', 'Trap', 'Dubstep', 'EDM', 'Acoustic', 'Ballad'
  ];
  
  const parts = genreString.split(',').map(p => p.trim());
  
  for (const part of parts) {
    const found = knownGenres.find(g => 
      part.toLowerCase().includes(g.toLowerCase())
    );
    if (found) return found;
  }
  
  for (const part of parts) {
    const words = part.split(' ').filter(w => w.length > 0);
    for (const word of words) {
      if (word.length > 2 && word[0] && word[0] === word[0].toUpperCase()) {
        return word;
      }
    }
  }
  
  const firstPart = parts[0];
  if (firstPart) {
    const firstWord = firstPart.split(' ')[0];
    return firstWord || 'Unknown';
  }
  return 'Unknown';
};

export const useBeats = (limit: number = 50) => {
  const { albums, isLoading, error } = useAlbums(limit);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Convert albums to beats format - memoized
  const beats = useMemo(() => {
    if (!albums || albums.length === 0) return [];
    
    return albums
      .sort((a, b) => parseInt(b.createdAt) - parseInt(a.createdAt))
      .flatMap((album, albumIndex) => 
        album.songs.map((songWrapper, songIndex) => {
          const song = songWrapper.song;
          const rawGenre = song.genre || 'Unknown';
          const mainGenre = extractMainGenre(rawGenre);
          const genreTag = mainGenre.toLowerCase().replace(/\s+/g, '-');
          
          return {
            id: parseInt(song.id) || (albumIndex * 1000 + songIndex),
            songId: song.id,
            title: song.title,
            artist: album.artist.displayName || album.artist.username,
            avatar: album.artist.avatarHash 
              ? `https://gateway.pinata.cloud/ipfs/${album.artist.avatarHash}`
              : undefined,
            avatarFallback: album.artist.displayName?.substring(0, 2).toUpperCase() || 
                           album.artist.username?.substring(0, 2).toUpperCase() || 'UN',
            cover: album.coverImageHash 
              ? `https://gateway.pinata.cloud/ipfs/${album.coverImageHash}`
              : '',
            genre: mainGenre,
            fullGenre: rawGenre,
            releaseDate: new Date(parseInt(album.createdAt) * 1000).toISOString(),
            duration: song.duration || '0:00',
            audioHash: song.audioHash || '',
            likes: 0,
            plays: 0,
            tags: [genreTag],
            description: album.description || `${album.albumType} by ${album.artist.displayName || album.artist.username}`,
            albumId: album.albumId,
            albumType: album.albumType
          };
        })
      );
  }, [albums]);

  // Get genre counts - memoized
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    beats.forEach(beat => {
      beat.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [beats]);

  // Get available genres - memoized
  const genres = useMemo(() => {
    const uniqueGenres = [
      { id: 'all', name: 'All Beats', count: beats.length }
    ];
    
    Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .forEach(([tag, count]) => {
        const displayName = tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        uniqueGenres.push({
          id: tag,
          name: count > 1 ? `${displayName}+` : displayName,
          count
        });
      });
    
    return uniqueGenres;
  }, [beats, genreCounts]);

  // Filter beats by selected genre - memoized
  const filteredBeats = useMemo(() => {
    if (selectedGenre === 'all') return beats;
    return beats.filter(beat => beat.tags.includes(selectedGenre));
  }, [beats, selectedGenre]);

  return {
    beats: filteredBeats,
    allBeats: beats,
    genres,
    selectedGenre,
    setSelectedGenre,
    isLoading,
    error
  };
};
