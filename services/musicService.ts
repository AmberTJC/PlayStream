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
    console.log("Fetching 30 popular tracks from Deezer chart");
    const response = await fetch(`${DEEZER_API_BASE}/chart/0/tracks?limit=30`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // Store tracks in cache
      tracksCache = data.data.map(convertDeezerTrack);
      console.log(`Retrieved ${tracksCache.length} popular tracks`);
      currentTrackIndex = 0;
      return tracksCache[0];
    }
    
    // If we still failed, try a different endpoint
    console.log("Falling back to search endpoint for popular tracks");
    const randomSearch = await fetch(`${DEEZER_API_BASE}/search?q=pop&limit=30`);
    const randomData = await randomSearch.json();
    
    if (randomData.data && randomData.data.length > 0) {
      tracksCache = randomData.data.map(convertDeezerTrack);
      console.log(`Retrieved ${tracksCache.length} tracks from fallback search`);
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
 * @param limit Number of results to return (default: 10, max: 100)
 * @returns Array of tracks if successful
 */
export const searchTracks = async (query: string, limit: number = 10): Promise<Track[]> => {
  try {
    console.log(`Searching for "${query}" with limit ${limit}`);
    
    // Ensure limit is valid
    const validLimit = Math.min(Math.max(1, limit), 100);
    
    // For larger result sets, we need to make multiple requests
    const batchSize = 25; // Deezer API limitation for single calls
    const batches = Math.ceil(validLimit / batchSize);
    let allResults: Track[] = [];
    
    for (let i = 0; i < batches && allResults.length < validLimit; i++) {
      const index = i * batchSize;
      const response = await fetch(
        `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${batchSize}&index=${index}`
      );
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const batchResults = data.data.map(convertDeezerTrack);
        allResults = [...allResults, ...batchResults];
      } else {
        break; // No more results available
      }
    }
    
    // Limit to requested number and deduplicate
    const trackIds = new Set();
    allResults = allResults.filter(track => {
      if (trackIds.has(track.id)) return false;
      trackIds.add(track.id);
      return true;
    }).slice(0, validLimit);
    
    console.log(`Retrieved ${allResults.length} unique tracks for search: "${query}"`);
    
    // Add search results to cache as well for more variety
    if (allResults.length > 0) {
      // Update cache with new unique tracks (prevent duplicates)
      const existingIds = new Set(tracksCache.map(t => t.id));
      const uniqueNewTracks = allResults.filter((t: Track) => !existingIds.has(t.id));
      
      if (uniqueNewTracks.length > 0) {
        console.log(`Adding ${uniqueNewTracks.length} new unique tracks to cache`);
        tracksCache = [...tracksCache, ...uniqueNewTracks];
      }
    }
    
    return allResults;
  } catch (error) {
    console.error("Error searching tracks:", error);
    return [];
  }
};

/**
 * Fetches tracks from a specific genre
 * @param genre The genre name to search for
 * @param limit Number of results to return (default: 10, max: 100)
 * @returns Array of tracks if successful
 */
export const fetchTracksByGenre = async (genre: string, limit: number = 10): Promise<Track[]> => {
  try {
    console.log(`Fetching ${limit} tracks for genre '${genre}'`);
    
    // Ensure limit is valid
    const validLimit = Math.min(Math.max(1, limit), 100);
    
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
      // Get more artists to increase variety
      const artistsResponse = await fetch(`${DEEZER_API_BASE}/genre/${genreId}/artists?limit=10`);
      const artistsData = await artistsResponse.json();
      
      if (artistsData.data && artistsData.data.length > 0) {
        const tracksPromises = artistsData.data.slice(0, 5).map(async (artist: any) => {
          try {
            const tracksPerArtist = Math.ceil(validLimit / 5);
            const tracksResponse = await fetch(`${DEEZER_API_BASE}/artist/${artist.id}/top?limit=${tracksPerArtist}`);
            const tracksData = await tracksResponse.json();
            
            if (tracksData.data && tracksData.data.length > 0) {
              return tracksData.data.map(convertDeezerTrack);
            }
            return [];
          } catch (error) {
            console.error(`Error fetching tracks for artist ${artist.id}:`, error);
            return [];
          }
        });
        
        const tracksArrays = await Promise.all(tracksPromises);
        let allTracks = tracksArrays.flat();
        
        // Deduplicate tracks by ID
        const trackIds = new Set();
        allTracks = allTracks.filter(track => {
          if (trackIds.has(track.id)) return false;
          trackIds.add(track.id);
          return true;
        });
        
        // Limit to requested number
        const results = allTracks.slice(0, validLimit);
        
        if (results.length > 0) {
          console.log(`Retrieved ${results.length} tracks for genre ${genre} from multiple artists`);
          
          // Add to cache for more variety
          const existingIds = new Set(tracksCache.map(t => t.id));
          const uniqueNewTracks = results.filter((t: Track) => !existingIds.has(t.id));
          
          if (uniqueNewTracks.length > 0) {
            tracksCache = [...tracksCache, ...uniqueNewTracks];
          }
          
          return results;
        }
      }
    }
    
    // Fallback: search for tracks with the genre name
    console.log(`Falling back to search for genre: ${genre}`);
    return searchTracks(genre, validLimit);
  } catch (error) {
    console.error(`Error fetching ${genre} tracks:`, error);
    // Fallback to general search
    return searchTracks(genre, Math.min(limit, 30)); // Limit fallback search to avoid too many requests
  }
};

/**
 * Fetches tracks from Deezer playlists
 * @param playlistName The name/keyword of the playlist to search for
 * @param limit Number of results to return (default: 10, max: 100)
 * @returns Array of tracks if successful
 */
export const fetchPlaylistTracks = async (playlistName: string, limit: number = 10): Promise<Track[]> => {
  try {
    console.log(`Fetching playlist tracks for "${playlistName}" with limit ${limit}`);
    
    // Ensure limit is valid
    const validLimit = Math.min(Math.max(1, limit), 100);
    
    // Search for playlists matching the name
    const playlistResponse = await fetch(
      `${DEEZER_API_BASE}/search/playlist?q=${encodeURIComponent(playlistName)}&limit=3`
    );
    const playlistData = await playlistResponse.json();
    
    let allTracks: Track[] = [];
    
    if (playlistData.data && playlistData.data.length > 0) {
      // Try up to 3 different playlists to get more variety
      const playlistPromises = playlistData.data.slice(0, 3).map(async (playlist: any) => {
        try {
          const tracksPerPlaylist = Math.ceil(validLimit / 3);
          
          // For larger result sets, we need to make multiple requests
          const batchSize = 25; // Deezer API limitation for single calls
          const batches = Math.ceil(tracksPerPlaylist / batchSize);
          let playlistTracks: Track[] = [];
          
          for (let i = 0; i < batches && playlistTracks.length < tracksPerPlaylist; i++) {
            const index = i * batchSize;
            const tracksResponse = await fetch(
              `${DEEZER_API_BASE}/playlist/${playlist.id}/tracks?limit=${batchSize}&index=${index}`
            );
            const tracksData = await tracksResponse.json();
            
            if (tracksData.data && tracksData.data.length > 0) {
              const batchResults = tracksData.data.map(convertDeezerTrack);
              playlistTracks = [...playlistTracks, ...batchResults];
            } else {
              break; // No more tracks in this playlist
            }
          }
          
          return playlistTracks.slice(0, tracksPerPlaylist);
        } catch (error) {
          console.error(`Error fetching tracks for playlist ${playlist.id}:`, error);
          return [];
        }
      });
      
      const tracksArrays = await Promise.all(playlistPromises);
      allTracks = tracksArrays.flat();
      
      // Deduplicate tracks by ID
      const trackIds = new Set();
      allTracks = allTracks.filter(track => {
        if (trackIds.has(track.id)) return false;
        trackIds.add(track.id);
        return true;
      }).slice(0, validLimit);
      
      if (allTracks.length > 0) {
        console.log(`Retrieved ${allTracks.length} tracks for playlist "${playlistName}"`);
        
        // Add to cache for more variety
        const existingIds = new Set(tracksCache.map(t => t.id));
        const uniqueNewTracks = allTracks.filter((t: Track) => !existingIds.has(t.id));
        
        if (uniqueNewTracks.length > 0) {
          console.log(`Adding ${uniqueNewTracks.length} new unique tracks to cache`);
          tracksCache = [...tracksCache, ...uniqueNewTracks];
        }
        
        return allTracks;
      }
    }
    
    // Fallback: just search for tracks with the playlist name as keyword
    console.log(`Falling back to search for playlist: ${playlistName}`);
    return searchTracks(playlistName, validLimit);
  } catch (error) {
    console.error(`Error fetching ${playlistName} playlist:`, error);
    return searchTracks(playlistName, Math.min(limit, 30)); // Limit fallback search
  }
};

/**
 * Force fetch new tracks to replace the current cache
 * @param genre Optional genre to specify what kind of tracks to get
 * @param limit Number of tracks to fetch (default: 100)
 * @returns Array of new tracks
 */
export const refreshTracks = async (genre?: string, limit: number = 100): Promise<Track[]> => {
  try {
    console.log(`Refreshing tracks cache with limit: ${limit}`);
    // Clear existing cache
    tracksCache = [];
    currentTrackIndex = 0;
    
    // Ensure limit is valid
    const validLimit = Math.min(Math.max(1, limit), 100);
    
    if (genre) {
      return await fetchTracksByGenre(genre, validLimit);
    } else {
      const response = await fetch(`${DEEZER_API_BASE}/chart/0/tracks?limit=${validLimit}`);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        console.log(`Retrieved ${data.data.length} tracks from chart`);
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