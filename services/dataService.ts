
import { Release, Artist, User, Ticket } from '../types';

/**
 * SCF Music - Data Service (Neon & Netlify API Edition)
 * Bu servis, Netlify Functions üzerinden Neon veritabanına bağlanır.
 */
const API_BASE = '/api';

export const DataService = {
  // Genel API İsteği Yardımcısı
  async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      // Netlify Functions henüz hazır değilse sessizce hata dönmek yerine kullanıcıya bilgi ver
      if (!response.ok) {
        console.warn(`API isteği başarısız (${endpoint}): ${response.status}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Bağlantı Hatası (${endpoint}):`, error);
      return null;
    }
  },

  // --- KULLANICI & ROL ---
  async syncUserProfile(user: User) {
    return this.request('/users/sync', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  async getUserRole(userId: string): Promise<'artist' | 'admin'> {
    const data = await this.request(`/users/role?id=${userId}`);
    return data?.role || 'artist';
  },

  // --- RELEASES (YAYINLAR) ---
  async createRelease(userId: string, releaseData: any) {
    return this.request('/releases', {
      method: 'POST',
      body: JSON.stringify({ userId, ...releaseData })
    });
  },

  async getReleases(userId?: string): Promise<Release[]> {
    const url = userId ? `/releases?userId=${userId}` : '/releases';
    const data = await this.request(url);
    if (!data || !Array.isArray(data)) return [];
    return data.map((r: any) => this.mapReleaseFromDB(r));
  },

  // Netlify'da realtime (SSE/WebSocket) yerine akıllı polling (sorgulama)
  subscribeToReleases(callback: (releases: Release[]) => void, userId?: string) {
    const fetchReleases = async () => {
      const data = await this.getReleases(userId);
      if (data) callback(data);
    };

    fetchReleases();
    const interval = setInterval(fetchReleases, 20000); // 20 saniyede bir güncelle
    return { unsubscribe: () => clearInterval(interval) };
  },

  // PostgreSQL snake_case -> Frontend camelCase Dönüşümü
  mapReleaseFromDB(db: any): Release {
    return {
      id: db.id,
      userId: db.user_id,
      artistName: db.artist_name || 'Bilinmeyen Sanatçı',
      songTitle: db.song_title,
      genre: db.genre,
      releaseDate: db.release_date,
      submissionDate: db.created_at,
      artworkPreview: db.artwork_url,
      status: db.status as any,
      royaltySplits: db.royalty_splits || [],
      streams: parseInt(db.streams) || 0,
      revenue: parseFloat(db.revenue) || 0,
      selectedServices: db.selected_services || [],
      copyrightYear: db.copyright_year || '2024',
      copyrightHolder: db.copyright_holder || '',
      publishingYear: db.publishing_year || '2024',
      publishingHolder: db.publishing_holder || '',
      producerCredits: db.producer_credits || '',
      composer: db.composer || '',
      lyricist: db.lyricist || '',
      contactEmail: db.contact_email || '',
      supportPhone: db.support_phone || '',
      pitchforkScore: db.pitchfork_score
    };
  },

  // --- ARTISTS (SANATÇILAR) ---
  async addArtist(userId: string, artist: Omit<Artist, 'id'>) {
    return this.request('/artists', {
      method: 'POST',
      body: JSON.stringify({ userId, ...artist })
    });
  },

  async getArtists(userId: string): Promise<Artist[]> {
    const data = await this.request(`/artists?userId=${userId}`);
    if (!data || !Array.isArray(data)) return [];
    return data.map((a: any) => ({
      id: a.id,
      name: a.name,
      spotifyUrl: a.spotify_url,
      instagramUrl: a.instagram_url
    }));
  },

  subscribeToArtists(userId: string, callback: (artists: Artist[]) => void) {
    const fetchArtists = async () => {
      const data = await this.getArtists(userId);
      if (data) callback(data);
    };

    fetchArtists();
    const interval = setInterval(fetchArtists, 60000); // 1 dakikada bir güncelle
    return { unsubscribe: () => clearInterval(interval) };
  }
};
