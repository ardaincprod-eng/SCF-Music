
import { supabase } from './supabase';
import { Release, Artist, User, Ticket, ReleaseStatus } from '../types';

export const DataService = {
  // --- AUTH & USER PROFILE ---
  async syncUserProfile(user: User) {
    if (!supabase || !supabase.from) return;
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_banned: user.isBanned || false
      });
    if (error) console.error("Error syncing profile:", error);
  },

  async getUserRole(userId: string): Promise<'artist' | 'admin'> {
    if (!supabase || !supabase.from) return 'artist';
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error || !data) return 'artist';
      return data.role;
    } catch {
      return 'artist';
    }
  },

  // --- RELEASES ---
  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    if (!supabase || !supabase.storage) throw new Error("Storage not configured");
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  async createRelease(userId: string, releaseData: any) {
    if (!supabase || !supabase.from) throw new Error("Database not configured");
    
    const { data, error } = await supabase
      .from('releases')
      .insert({
        user_id: userId,
        song_title: releaseData.songTitle,
        artist_name: releaseData.artistName,
        genre: releaseData.genre,
        release_date: releaseData.releaseDate,
        pitchfork_score: releaseData.pitchforkScore ? parseFloat(releaseData.pitchforkScore) : null,
        copyright_year: releaseData.copyrightYear,
        copyright_holder: releaseData.copyrightHolder,
        publishing_year: releaseData.publishingYear,
        publishing_holder: releaseData.publishingHolder,
        contact_email: releaseData.contactEmail,
        support_phone: releaseData.supportPhone,
        artwork_url: releaseData.artworkPreview,
        audio_url: releaseData.audioUrl,
        status: 'Pending Approval',
        royalty_splits: releaseData.royaltySplits,
        selected_services: releaseData.selectedServices
      })
      .select();

    if (error) throw error;
    return data[0];
  },

  subscribeToReleases(callback: (releases: Release[]) => void, userId?: string) {
    if (!supabase || !supabase.from) return { unsubscribe: () => {} };

    const fetchInitial = async () => {
      let query = supabase.from('releases').select('*');
      if (userId) query = query.eq('user_id', userId);
      
      const { data } = await query.order('created_at', { ascending: false });
      if (data) {
        callback(data.map(this.mapReleaseFromDB));
      }
    };

    fetchInitial();

    return supabase
      .channel('public:releases')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'releases' }, () => {
        fetchInitial();
      })
      .subscribe();
  },

  mapReleaseFromDB(dbRelease: any): Release {
    return {
      id: dbRelease.id,
      userId: dbRelease.user_id,
      artistName: dbRelease.artist_name || 'Various Artists',
      songTitle: dbRelease.song_title,
      genre: dbRelease.genre,
      releaseDate: dbRelease.release_date,
      submissionDate: dbRelease.created_at,
      pitchforkScore: dbRelease.pitchfork_score?.toString(),
      copyrightYear: dbRelease.copyright_year,
      copyrightHolder: dbRelease.copyright_holder,
      publishingYear: dbRelease.publishing_year,
      publishingHolder: dbRelease.publishing_holder,
      producerCredits: dbRelease.producer_credits,
      composer: dbRelease.composer,
      lyricist: dbRelease.lyricist,
      contactEmail: dbRelease.contact_email,
      supportPhone: dbRelease.support_phone,
      artworkPreview: dbRelease.artwork_url,
      selectedServices: dbRelease.selected_services || [],
      status: dbRelease.status as any,
      royaltySplits: dbRelease.royalty_splits || [],
      streams: dbRelease.streams || 0,
      revenue: dbRelease.revenue || 0
    };
  },

  // --- ARTISTS ---
  async addArtist(userId: string, artist: Omit<Artist, 'id'>) {
    if (!supabase || !supabase.from) throw new Error("Database not configured");
    const { error } = await supabase
      .from('artists')
      .insert({
        user_id: userId,
        name: artist.name,
        spotify_url: artist.spotifyUrl,
        instagram_url: artist.instagramUrl
      });
    if (error) throw error;
  },

  subscribeToArtists(userId: string, callback: (artists: Artist[]) => void) {
    if (!supabase || !supabase.from) return { unsubscribe: () => {} };

    const fetchInitial = async () => {
      const { data } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', userId);
      
      if (data) {
        callback(data.map(a => ({
          id: a.id,
          name: a.name,
          spotifyUrl: a.spotify_url,
          instagramUrl: a.instagram_url
        })));
      }
    };

    fetchInitial();

    return supabase
      .channel('public:artists')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artists', filter: `user_id=eq.${userId}` }, () => {
        fetchInitial();
      })
      .subscribe();
  },

  // --- TICKETS ---
  async createTicket(ticket: any) {
    if (!supabase || !supabase.from) throw new Error("Database not configured");
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        user_id: ticket.userId,
        subject: ticket.subject,
        category: ticket.category,
        status: 'Open'
      })
      .select();

    if (error) throw error;

    await supabase.from('ticket_messages').insert({
      ticket_id: data[0].id,
      sender_id: ticket.userId,
      text: ticket.messages[0].text
    });
  }
};
