// FIX: Add import for React to resolve 'Cannot find namespace 'React'' error.
import React from 'react';

export enum View {
  LANDING = 'landing',
  FORM = 'form',
  DASHBOARD = 'dashboard',
  LOGIN = 'login',
  REGISTER = 'register',
  MY_RELEASES = 'my-releases',
  ADMIN = 'admin',
  PAYOUTS = 'payouts',
  PROFILE = 'profile',
  ARTISTS = 'artists',
  CARDS = 'cards',
  TRACKS = 'tracks',
  INSIGHTS = 'insights',
  TICKETS = 'tickets',
}

export enum DistributionStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  IN_REVIEW = 'In Review',
  LIVE = 'Live',
  ERROR = 'Error',
}

export enum ReleaseStatus {
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this should be a hash
  role: 'artist' | 'admin';
  isBanned?: boolean; // New property to track ban status
}

export interface Artist {
  id: string;
  name: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  instagramUrl?: string;
}

export interface PaymentDetails {
  paypalEmail: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface RoyaltySplit {
  collaboratorName: string;
  role: string;
  share: number;
}

export interface StatusHistoryEntry {
  status: ReleaseStatus;
  date: string;
  note?: string;
}

export interface ReleaseArtist {
  id: string;
  name: string;
  role: string;
  bio?: string;
}

export interface Release {
  id: string;
  userId: string;
  artistName: string; // This is often the user's name but can be different
  songTitle: string;
  genre: string;
  releaseDate: string;
  submissionDate?: string; // Date when the user clicked submit
  pitchforkScore?: string; // Optional score (e.g. "8.5")
  copyrightYear: string;
  copyrightHolder: string;
  publishingYear: string;
  publishingHolder: string;
  producerCredits: string;
  composer: string;
  lyricist: string;
  contactEmail: string;
  supportPhone: string;
  audioFile?: File; // Made optional for persistence and editing flows
  artworkPreview: string;
  selectedServices: string[];
  status: ReleaseStatus;
  statusUpdateDate?: string;
  statusHistory?: StatusHistoryEntry[]; // Added for history tracking
  royaltySplits: RoyaltySplit[];
  streams?: number; // Added for royalty management
  revenue?: number; // Added for royalty management
  artists?: ReleaseArtist[]; // Detailed artist info including roles and bios
}

export interface StreamingService {
  id: string;
  name: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  date: string;
  isAdmin: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: string;
  status: 'Open' | 'Closed' | 'Resolved';
  lastUpdated: string;
  messages: TicketMessage[];
  readByArtist: boolean;
  readByAdmin: boolean;
}