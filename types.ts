
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

export enum ReleaseStatus {
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// Added missing DistributionStatus enum used in Dashboard.tsx
export enum DistributionStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  IN_REVIEW = 'In Review',
  LIVE = 'Live',
  ERROR = 'Error',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'artist' | 'admin';
  isBanned?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  spotifyUrl?: string;
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

export interface ReleaseArtist {
  id: string;
  name: string;
  role: string;
  bio?: string;
}

// Added missing StreamingService interface used in ReleaseForm.tsx
export interface StreamingService {
  id: string;
  name: string;
}

export interface Release {
  id: string;
  userId: string;
  artistName: string;
  songTitle: string;
  genre: string;
  releaseDate: string;
  submissionDate?: string;
  pitchforkScore?: string;
  copyrightYear: string;
  copyrightHolder: string;
  publishingYear: string;
  publishingHolder: string;
  producerCredits: string;
  composer: string;
  lyricist: string;
  contactEmail: string;
  supportPhone: string;
  audioFile?: File;
  artworkPreview: string;
  selectedServices: string[];
  status: ReleaseStatus;
  royaltySplits: RoyaltySplit[];
  streams?: number;
  revenue?: number;
  artists?: ReleaseArtist[];
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
