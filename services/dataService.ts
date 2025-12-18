import { Release, Artist, User, Ticket, ReleaseStatus } from '../types.ts';

// Helper to manage localStorage
const storage = {
    get: (key: string) => {
        const data = localStorage.getItem(`scf_${key}`);
        return data ? JSON.parse(data) : null;
    },
    set: (key: string, data: any) => {
        localStorage.setItem(`scf_${key}`, JSON.stringify(data));
    }
};

export const DataService = {
  // User Operations
  async syncUserProfile(user: User) {
    storage.set('user', user);
    return user;
  },

  async getUserRole(userId: string): Promise<'artist' | 'admin'> {
    const user = storage.get('user');
    if (user && user.id === userId) return user.role;
    return 'artist';
  },

  // Release Operations
  async createRelease(userId: string, releaseData: any) {
    const releases = await this.getReleases();
    const newRelease: Release = {
        ...releaseData,
        id: 'REL' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        userId: userId,
        status: ReleaseStatus.PENDING_APPROVAL,
        submissionDate: new Date().toISOString(),
        streams: 0,
        revenue: 0,
        royaltySplits: releaseData.royaltySplits || []
    };
    storage.set('releases', [newRelease, ...releases]);
    return newRelease;
  },

  async getReleases(userId?: string): Promise<Release[]> {
    const releases: Release[] = storage.get('releases') || [];
    if (userId) {
        return releases.filter(r => r.userId === userId);
    }
    return releases;
  },

  // Artist Operations
  async getArtists(userId: string): Promise<Artist[]> {
    const artists: Artist[] = storage.get('artists') || [];
    return artists.filter((a: any) => a.userId === userId);
  },

  async addArtist(userId: string, artist: Omit<Artist, 'id'>) {
    const artists = storage.get('artists') || [];
    const newArtist = {
        ...artist,
        id: 'ART' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        userId: userId
    };
    storage.set('artists', [newArtist, ...artists]);
    return newArtist;
  },

  // Subscription simulation (Local storage doesn't need real subs, but we keep the interface)
  subscribeToReleases(callback: (releases: Release[]) => void, userId?: string) {
    const check = async () => {
        const data = await this.getReleases(userId);
        callback(data);
    };
    const interval = setInterval(check, 5000);
    check();
    return { unsubscribe: () => clearInterval(interval) };
  },

  subscribeToArtists(userId: string, callback: (artists: Artist[]) => void) {
    const check = async () => {
        const data = await this.getArtists(userId);
        callback(data);
    };
    const interval = setInterval(check, 5000);
    check();
    return { unsubscribe: () => clearInterval(interval) };
  },

  // Ticket Operations
  async getTickets(userId?: string): Promise<Ticket[]> {
    const tickets: Ticket[] = storage.get('tickets') || [];
    if (userId) return tickets.filter(t => t.userId === userId);
    return tickets;
  },

  async createTicket(userId: string, userName: string, subject: string, category: string, message: string) {
    const tickets = await this.getTickets();
    const newTicket: Ticket = {
        id: 'TCK' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        userId,
        userName,
        subject,
        category,
        status: 'Open',
        lastUpdated: new Date().toISOString(),
        readByArtist: true,
        readByAdmin: false,
        messages: [{
            id: 'MSG' + Date.now(),
            senderId: userId,
            senderName: userName,
            text: message,
            date: new Date().toISOString(),
            isAdmin: false
        }]
    };
    storage.set('tickets', [newTicket, ...tickets]);
    return newTicket;
  },

  async replyTicket(ticketId: string, senderId: string, senderName: string, text: string, isAdmin: boolean) {
    const tickets = await this.getTickets();
    const updatedTickets = tickets.map(t => {
        if (t.id === ticketId) {
            return {
                ...t,
                lastUpdated: new Date().toISOString(),
                readByArtist: !isAdmin,
                readByAdmin: isAdmin,
                messages: [...t.messages, {
                    id: 'MSG' + Date.now(),
                    senderId,
                    senderName,
                    text,
                    date: new Date().toISOString(),
                    isAdmin
                }]
            };
        }
        return t;
    });
    storage.set('tickets', updatedTickets);
  }
};