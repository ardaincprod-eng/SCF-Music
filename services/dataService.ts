import { db, storage } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { Release, Artist, User, Ticket } from '../types';

export const FirebaseService = {
  // --- AUTH & PROFILE ---
  async syncUserProfile(user: User) {
    const userRef = doc(db, "users", user.id);
    await setDoc(userRef, {
      name: user.name,
      email: user.email,
      role: user.role,
      isBanned: user.isBanned || false
    }, { merge: true });
  },

  // --- RELEASES ---
  async uploadFile(file: File, path: string): Promise<string> {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },

  async createRelease(userId: string, releaseData: any) {
    const colRef = collection(db, "releases");
    return addDoc(colRef, {
      ...releaseData,
      userId,
      createdAt: new Date().toISOString()
    });
  },

  subscribeToReleases(callback: (releases: Release[]) => void, userId?: string) {
    const colRef = collection(db, "releases");
    const q = userId ? query(colRef, where("userId", "==", userId)) : colRef;
    
    return onSnapshot(q, (snapshot) => {
      const releases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Release));
      callback(releases);
    });
  },

  // --- ARTISTS ---
  async addArtist(userId: string, artist: Omit<Artist, 'id'>) {
    const colRef = collection(db, "artists");
    return addDoc(colRef, { ...artist, userId });
  },

  subscribeToArtists(userId: string, callback: (artists: Artist[]) => void) {
    const q = query(collection(db, "artists"), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const artists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Artist));
      callback(artists);
    });
  },

  // --- TICKETS ---
  async createTicket(ticket: any) {
    return addDoc(collection(db, "tickets"), ticket);
  },

  subscribeToTickets(callback: (tickets: Ticket[]) => void, userId?: string) {
    const colRef = collection(db, "tickets");
    const q = userId ? query(colRef, where("userId", "==", userId)) : colRef;
    
    return onSnapshot(q, (snapshot) => {
      const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Ticket));
      callback(tickets);
    });
  }
};
