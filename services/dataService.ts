
import { Release, Artist, User, Ticket, ReleaseStatus } from '../types';

const getStore = (key: string) => {
  try {
    const data = localStorage.getItem(`scf_v2_${key}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return [];
  }
};

const setStore = (key: string, data: any) => {
  try {
    localStorage.setItem(`scf_v2_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
};

export const DataService = {
  async getReleases(userId?: string): Promise<Release[]> {
    const all = getStore('releases');
    return userId ? all.filter((r: Release) => r.userId === userId) : all;
  },

  async createRelease(userId: string, data: any): Promise<Release> {
    const all = await this.getReleases();
    const newRelease: Release = {
      ...data,
      id: 'REL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId,
      status: ReleaseStatus.PENDING_APPROVAL,
      submissionDate: new Date().toISOString(),
      streams: 0,
      revenue: 0
    };
    setStore('releases', [newRelease, ...all]);
    return newRelease;
  },

  async getArtists(userId: string): Promise<Artist[]> {
    const all = getStore('artists');
    return all.filter((a: Artist) => a.userId === userId);
  },

  async addArtist(userId: string, name: string): Promise<Artist> {
    const all = getStore('artists');
    const newArtist = { id: 'ART-' + Date.now(), name, userId };
    setStore('artists', [...all, newArtist]);
    return newArtist;
  },

  async getTickets(userId?: string): Promise<Ticket[]> {
    const all = getStore('tickets');
    return userId ? all.filter((t: Ticket) => t.userId === userId) : all;
  }
};
