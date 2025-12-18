
import { Release, Artist, User, Ticket, ReleaseStatus } from '../types';

const API_BASE = '/api';

const getLocal = (key: string) => {
    const data = localStorage.getItem(`scf_${key}`);
    return data ? JSON.parse(data) : null;
};

const setLocal = (key: string, data: any) => {
    localStorage.setItem(`scf_${key}`, JSON.stringify(data));
};

export const DataService = {
  async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async syncUserProfile(user: User) {
    setLocal('current_user', user);
    return this.request('/users/sync', { 
        method: 'POST', 
        body: JSON.stringify(user) 
    });
  },

  async getUserRole(userId: string): Promise<'artist' | 'admin'> {
    const data = await this.request(`/users/role?id=${userId}`);
    if (data?.role) return data.role;
    const localUser = getLocal('current_user');
    return localUser?.role || 'artist';
  },

  async createRelease(userId: string, releaseData: any) {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newRelease = { 
        id: tempId,
        user_id: userId,
        artist_name: releaseData.artistName,
        song_title: releaseData.songTitle,
        genre: releaseData.genre,
        release_date: releaseData.releaseDate,
        artwork_url: releaseData.artworkPreview,
        selected_services: releaseData.selectedServices,
        royalty_splits: releaseData.royaltySplits,
        copyright_year: releaseData.copyrightYear,
        copyright_holder: releaseData.copyrightHolder,
        publishing_year: releaseData.publishingYear,
        publishing_holder: releaseData.publishingHolder,
        producer_credits: releaseData.producerCredits,
        composer: releaseData.composer,
        lyricist: releaseData.lyricist,
        contact_email: releaseData.contactEmail,
        support_phone: releaseData.supportPhone,
        status: ReleaseStatus.PENDING_APPROVAL
    };
    
    const currentReleases = getLocal(`releases_${userId}`) || [];
    setLocal(`releases_${userId}`, [this.mapReleaseFromDB(newRelease), ...currentReleases]);
    
    return this.request('/releases', { 
        method: 'POST', 
        body: JSON.stringify(newRelease) 
    });
  },

  async getReleases(userId?: string): Promise<Release[]> {
    const endpoint = userId ? `/releases?userId=${userId}` : '/releases';
    const data = await this.request(endpoint);
    
    if (data && Array.isArray(data)) {
        const mapped = data.map(r => this.mapReleaseFromDB(r));
        if (userId) setLocal(`releases_${userId}`, mapped);
        return mapped;
    }
    return userId ? (getLocal(`releases_${userId}`) || []) : [];
  },

  mapReleaseFromDB(db: any): Release {
    return {
      id: db.id,
      userId: db.user_id || db.userId,
      artistName: db.artist_name || db.artistName || 'Bilinmiyor',
      songTitle: db.song_title || db.songTitle || 'İsimsiz',
      genre: db.genre || 'Pop',
      releaseDate: db.release_date || db.releaseDate,
      submissionDate: db.created_at || db.submissionDate || new Date().toISOString(),
      artworkPreview: db.artwork_url || db.artworkPreview,
      status: (db.status as any) || ReleaseStatus.PENDING_APPROVAL,
      royaltySplits: db.royalty_splits || db.royaltySplits || [],
      streams: parseInt(db.streams) || 0,
      revenue: parseFloat(db.revenue) || 0,
      selectedServices: db.selected_services || db.selectedServices || [],
      copyrightYear: db.copyright_year || db.copyrightYear || '',
      copyrightHolder: db.copyright_holder || db.copyrightHolder || '',
      publishingYear: db.publishing_year || db.publishingYear || '',
      publishingHolder: db.publishing_holder || db.publishingHolder || '',
      producerCredits: db.producer_credits || db.producerCredits || '',
      composer: db.composer || '',
      lyricist: db.lyricist || '',
      contactEmail: db.contact_email || db.contactEmail || '',
      supportPhone: db.support_phone || db.supportPhone || '',
      artists: db.artists || []
    };
  },

  async addArtist(userId: string, artist: Omit<Artist, 'id'>) {
    const tempId = Math.random().toString(36).substr(2, 5);
    const newArtist = { 
        id: tempId, 
        user_id: userId,
        name: artist.name,
        spotify_url: artist.spotifyUrl,
        instagram_url: artist.instagramUrl
    };
    const currentArtists = getLocal(`artists_${userId}`) || [];
    setLocal(`artists_${userId}`, [{
        id: tempId,
        name: artist.name,
        spotifyUrl: artist.spotifyUrl,
        instagramUrl: artist.instagramUrl
    }, ...currentArtists]);
    
    return this.request('/artists', { method: 'POST', body: JSON.stringify(newArtist) });
  },

  async getArtists(userId: string): Promise<Artist[]> {
    const data = await this.request(`/artists?userId=${userId}`);
    if (data && Array.isArray(data)) {
        return data.map(a => ({
            id: a.id,
            name: a.name,
            spotifyUrl: a.spotify_url || a.spotifyUrl,
            instagramUrl: a.instagram_url || a.instagramUrl
        }));
    }
    return getLocal(`artists_${userId}`) || [];
  },

  subscribeToReleases(callback: (releases: Release[]) => void, userId?: string) {
    const interval = setInterval(async () => {
      const data = await this.getReleases(userId);
      callback(data);
    }, 15000);
    return { unsubscribe: () => clearInterval(interval) };
  },

  subscribeToArtists(userId: string, callback: (artists: Artist[]) => void) {
    const interval = setInterval(async () => {
      const data = await this.getArtists(userId);
      callback(data);
    }, 30000);
    return { unsubscribe: () => clearInterval(interval) };
  },

  async getTickets(userId?: string): Promise<Ticket[]> {
    const data = await this.request(userId ? `/tickets?userId=${userId}` : '/tickets');
    if (data && Array.isArray(data)) {
        return data.map(t => ({
            id: t.id,
            userId: t.user_id,
            userName: t.user_name,
            subject: t.subject,
            category: t.category,
            status: t.status,
            lastUpdated: t.last_updated,
            readByArtist: t.read_by_artist,
            readByAdmin: t.read_by_admin,
            messages: (t.messages || []).map((m: any) => ({
                id: m.id,
                senderId: m.sender_id,
                senderName: m.sender_name,
                text: m.text,
                date: m.created_at,
                isAdmin: m.is_admin
            }))
        }));
    }
    return [];
  },

  async createTicket(userId: string, userName: string, subject: string, category: string, message: string) {
    return this.request('/tickets', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, user_name: userName, subject, category, message_text: message })
    });
  },

  async replyTicket(ticketId: string, senderId: string, senderName: string, text: string, isAdmin: boolean) {
    return this.request(`/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ sender_id: senderId, sender_name: senderName, text, is_admin: isAdmin })
    });
  }
};
