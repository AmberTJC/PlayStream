import { Alert } from 'react-native';

// Use Deezer API which doesn't require authentication for basic searches
const DEEZER_API_BASE = 'https://api.deezer.com';

// Define a common placeholder image in case album art is missing
const DEFAULT_IMAGE = 'https://e-cdns-images.dzcdn.net/images/cover/1000x1000-000000-80-0-0.jpg';

// Cache for tracks to avoid repeated API calls
let tracksCache: Track[] = [];
let currentTrackIndex = 0;

// Define different genres with pre-selected tracks
const GENRES = {
  trending: [0, 1, 2, 3],
  piano: [0],
  guitar: [1],
  ambient: [2],
  focus: [3],
  chill: [0, 2],
  jazz: [1, 3]
};

interface Track {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  audio: string;
  image: string;
  duration: number;
}

// Helper function to convert Deezer track to our Track format
const convertDeezerTrack = (deezerTrack: any): Track => {
  return {
    id: deezerTrack.id.toString(),
    name: deezerTrack.title,
    artist_name: deezerTrack.artist.name,
    album_name: deezerTrack.album.title,
    audio: deezerTrack.preview, // This is a 30-second preview
    image: deezerTrack.album.cover_medium || DEFAULT_IMAGE,
    duration: deezerTrack.duration * 1000, // Convert to ms
  };
};

/**
 * Fetches a track to play - provides variety by getting random tracks
 * @returns A track object if successful
 */
export const fetchPopularTrack = async (): Promise<Track | null> => {
  try {
    // If we have tracks in cache, return the next one
    if (tracksCache.length > 0) {
      currentTrackIndex = (currentTrackIndex + 1) % tracksCache.length;
      return tracksCache[currentTrackIndex];
    }
    
    // Otherwise, fetch a batch of tracks from Deezer chart
    const response = await fetch(`${DEEZER_API_BASE}/chart/0/tracks?limit=10`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // Store tracks in cache
      tracksCache = data.data.map(convertDeezerTrack);
      currentTrackIndex = 0;
      return tracksCache[0];
    }
    
    // If we still failed, try a different endpoint
    const randomSearch = await fetch(`${DEEZER_API_BASE}/search?q=pop&limit=10`);
    const randomData = await randomSearch.json();
    
    if (randomData.data && randomData.data.length > 0) {
      tracksCache = randomData.data.map(convertDeezerTrack);
      currentTrackIndex = 0;
      return tracksCache[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return null;
  }
};

/**
 * Search for tracks by query term using Deezer
 * @param query The search term
 * @param limit Number of results to return (default: 10)
 * @returns Array of tracks if successful
 */
export const searchTracks = async (query: string, limit: number = 10): Promise<Track[]> => {
  try {
    const response = await fetch(
      `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // Add search results to cache as well for more variety
      const newTracks = data.data.map(convertDeezerTrack);
      
      // Update cache with new unique tracks (prevent duplicates)
      const existingIds = new Set(tracksCache.map(t => t.id));
      const uniqueNewTracks = newTracks.filter((t: Track) => !existingIds.has(t.id));
      
      if (uniqueNewTracks.length > 0) {
        tracksCache = [...tracksCache, ...uniqueNewTracks];
      }
      
      return newTracks;
    }
    return [];
  } catch (error) {
    console.error("Error searching tracks:", error);
    return [];
  }
};

/**
 * Fetches tracks from a specific genre using Deezer
 * @param genre The genre to fetch (e.g. 'rock', 'pop', 'jazz')
 * @param limit Number of results to return (default: 10)
 * @returns Array of tracks if successful
 */
export const fetchTracksByGenre = async (genre: string, limit: number = 10): Promise<Track[]> => {
  try {
    // First try to get genre ID
    const genreResponse = await fetch(`${DEEZER_API_BASE}/genre`);
    const genreData = await genreResponse.json();
    
    let genreId = 0; // Default genre ID
    
    if (genreData.data) {
      // Find genre by name (case insensitive)
      const foundGenre = genreData.data.find((g: any) => 
        g.name.toLowerCase() === genre.toLowerCase()
      );
      
      if (foundGenre) {
        genreId = foundGenre.id;
      }
    }
    
    // If we found a genre ID, get artists from that genre
    if (genreId > 0) {
      const artistsResponse = await fetch(`${DEEZER_API_BASE}/genre/${genreId}/artists`);
      const artistsData = await artistsResponse.json();
      
      if (artistsData.data && artistsData.data.length > 0) {
        // Get tracks from the first artist
        const artistId = artistsData.data[0].id;
        const tracksResponse = await fetch(`${DEEZER_API_BASE}/artist/${artistId}/top?limit=${limit}`);
        const tracksData = await tracksResponse.json();
        
        if (tracksData.data && tracksData.data.length > 0) {
          const newTracks = tracksData.data.map(convertDeezerTrack);
          
          // Add to cache for more variety
          const existingIds = new Set(tracksCache.map(t => t.id));
          const uniqueNewTracks = newTracks.filter((t: Track) => !existingIds.has(t.id));
          
          if (uniqueNewTracks.length > 0) {
            tracksCache = [...tracksCache, ...uniqueNewTracks];
          }
          
          return newTracks;
        }
      }
    }
    
    // Fallback: search for tracks with the genre name
    return searchTracks(genre, limit);
  } catch (error) {
    console.error(`Error fetching ${genre} tracks:`, error);
    // Fallback to general search
    return searchTracks(genre, limit);
  }
};

/**
 * Fetches tracks from Deezer playlists
 * @param playlistName The name/keyword of the playlist to search for
 * @param limit Number of results to return (default: 10)
 * @returns Array of tracks if successful
 */
export const fetchPlaylistTracks = async (playlistName: string, limit: number = 10): Promise<Track[]> => {
  try {
    // Search for playlists matching the name
    const playlistResponse = await fetch(
      `${DEEZER_API_BASE}/search/playlist?q=${encodeURIComponent(playlistName)}&limit=1`
    );
    const playlistData = await playlistResponse.json();
    
    if (playlistData.data && playlistData.data.length > 0) {
      const playlistId = playlistData.data[0].id;
      
      // Get tracks from the playlist
      const tracksResponse = await fetch(`${DEEZER_API_BASE}/playlist/${playlistId}/tracks?limit=${limit}`);
      const tracksData = await tracksResponse.json();
      
      if (tracksData.data && tracksData.data.length > 0) {
        const newTracks = tracksData.data.map(convertDeezerTrack);
        
        // Add to cache for more variety
        const existingIds = new Set(tracksCache.map(t => t.id));
        const uniqueNewTracks = newTracks.filter((t: Track) => !existingIds.has(t.id));
        
        if (uniqueNewTracks.length > 0) {
          tracksCache = [...tracksCache, ...uniqueNewTracks];
        }
        
        return newTracks;
      }
    }
    
    // Fallback: just search for tracks with the playlist name as keyword
    return searchTracks(playlistName, limit);
  } catch (error) {
    console.error(`Error fetching ${playlistName} playlist:`, error);
    return searchTracks(playlistName, limit);
  }
};

/**
 * Force fetch new tracks to replace the current cache
 * @param genre Optional genre to specify what kind of tracks to get
 * @returns Array of new tracks
 */
export const refreshTracks = async (genre?: string): Promise<Track[]> => {
  try {
    // Clear existing cache
    tracksCache = [];
    currentTrackIndex = 0;
    
    if (genre) {
      return await fetchTracksByGenre(genre, 20);
    } else {
      const response = await fetch(`${DEEZER_API_BASE}/chart/0/tracks?limit=20`);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        tracksCache = data.data.map(convertDeezerTrack);
        return tracksCache;
      }
    }
    
    return [];
  } catch (error) {
    console.error("Error refreshing tracks:", error);
    return [];
  }
};

export type { Track }; 