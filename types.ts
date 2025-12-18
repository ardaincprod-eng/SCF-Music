
// Application state views
export enum View {
  LANDING = 'landing',
  LOGIN = 'login',
  REGISTER = 'register',
  PROFILE = 'profile',
  FORM = 'form',
  MY_RELEASES = 'my-releases',
  ARTISTS = 'artists',
  PAYOUTS = 'payouts',
  CARDS = 'cards',
  TICKETS = 'tickets',
  ADMIN = 'admin',
  DASHBOARD = 'dashboard'
}

// Internal submission status
export enum ReleaseStatus {
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// Fix: Added DistributionStatus enum used in the Dashboard component to track store delivery progress
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
}

export interface Artist {
  id: string;
  name: string;
  userId: string;
  spotifyUrl?: string;
  instagramUrl?: string;
}

// Fix: Added missing RoyaltySplit interface used in the ReleaseForm component
export interface RoyaltySplit {
  collaboratorName: string;
  role: string;
  share: number;
}

// Fix: Added missing StreamingService interface used for distribution constants
export interface StreamingService {
  id: string;
  name: string;
}

// Fix: Added missing ReleaseArtist interface to support multi-artist submissions
export interface ReleaseArtist {
  id: string;
  name: string;
  role: string;
  bio: string;
}

export interface Release {
  id: string;
  userId: string;
  artistName: string;
  songTitle: string;
  genre: string;
  releaseDate: string;
  submissionDate: string;
  artworkPreview: string;
  status: ReleaseStatus;
  streams: number;
  revenue: number;
  // Fix: Expanded Release interface with additional metadata fields used in Dashboard, Admin, and Tracks components
  statusUpdateDate?: string;
  selectedServices: string[];
  royaltySplits: RoyaltySplit[];
  pitchforkScore?: number;
  copyrightYear?: string;
  copyrightHolder?: string;
  publishingYear?: string;
  publishingHolder?: string;
  contactEmail?: string;
  supportPhone?: string;
  producerCredits?: string;
  composer?: string;
  lyricist?: string;
  artists?: ReleaseArtist[];
  audioFile?: File | null;
}

// Fix: Added missing TicketMessage interface for support ticket conversation threads
export interface TicketMessage {
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
  // Fix: Updated messages property to use the new TicketMessage interface
  messages: TicketMessage[];
  readByArtist: boolean;
  readByAdmin: boolean;
}

// Fix: Added missing PaymentDetails interface for user banking/paypal information in the Cards component
export interface PaymentDetails {
  paypalEmail: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
