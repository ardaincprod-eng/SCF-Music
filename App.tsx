import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ReleaseForm } from './components/ReleaseForm';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { MyReleases } from './components/MyReleases';
import { AdminDashboard } from './components/AdminDashboard';
import { Payouts } from './components/Payouts';
import { Sidebar } from './components/Sidebar';
import { UserProfile } from './components/UserProfile';
import { Artists } from './components/Artists';
import { Cards } from './components/Cards';
import { Tracks } from './components/Tracks';
import { Insights } from './components/Insights';
import { Tickets } from './components/Tickets';
import { Release, View, User, ReleaseStatus, Artist, Ticket, TicketMessage } from './types';
import { FirebaseService } from './services/dataService';
import { auth } from './services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentRelease, setCurrentRelease] = useState<Release | null>(null);
  const [releaseToEdit, setReleaseToEdit] = useState<Release | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Auth Takibi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase'den kullanıcı detaylarını al (Gerekirse Firestore'dan rol bilgisini çek)
        const user: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Artist',
          email: firebaseUser.email || '',
          password: '', // Şifre client tarafında tutulmaz
          role: firebaseUser.email === 'admin@scfmusic.com' ? 'admin' : 'artist'
        };
        setCurrentUser(user);
        FirebaseService.syncUserProfile(user);
        if (view === View.LOGIN || view === View.REGISTER || view === View.LANDING) {
          setView(View.PROFILE);
        }
      } else {
        setCurrentUser(null);
        if (![View.LANDING, View.LOGIN, View.REGISTER].includes(view)) {
          setView(View.LANDING);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Veri Abonelikleri (Real-time)
  useEffect(() => {
    if (!currentUser) return;

    const unsubReleases = FirebaseService.subscribeToReleases(
      (data) => setReleases(data),
      currentUser.role === 'admin' ? undefined : currentUser.id
    );

    const unsubArtists = FirebaseService.subscribeToArtists(
      currentUser.id,
      (data) => setArtists(data)
    );

    const unsubTickets = FirebaseService.subscribeToTickets(
      (data) => setTickets(data),
      currentUser.role === 'admin' ? undefined : currentUser.id
    );

    return () => {
      unsubReleases();
      unsubArtists();
      unsubTickets();
    };
  }, [currentUser]);

  const handleLogin = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Profil ismini güncellemek için ek işlemler yapılabilir
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView(View.LANDING);
  };

  const handleReleaseSubmit = async (releaseData: any) => {
    if (!currentUser) return;

    let audioUrl = "";
    let artworkUrl = releaseData.artworkPreview;

    // Dosya yükleme işlemleri
    if (releaseData.audioFile) {
      audioUrl = await FirebaseService.uploadFile(
        releaseData.audioFile, 
        `audio/${currentUser.id}/${Date.now()}_${releaseData.audioFile.name}`
      );
    }

    await FirebaseService.createRelease(currentUser.id, {
      ...releaseData,
      audioUrl,
      status: ReleaseStatus.PENDING_APPROVAL,
    });

    setView(View.MY_RELEASES);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // ... (Geri kalan render mantığı sidebar ve view'lar aynı kalacak şekilde devam eder)
  const isAdmin = currentUser?.role === 'admin';

  const renderAuthView = () => {
    if (!currentUser) return null;
    switch(view) {
        case View.PROFILE: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
        case View.FORM: return <ReleaseForm onSubmit={handleReleaseSubmit} existingArtists={artists} releaseToEdit={releaseToEdit} />;
        case View.ARTISTS: return <Artists artists={artists} onAddArtist={(a) => FirebaseService.addArtist(currentUser.id, a)} onDeleteArtist={() => {}} />;
        case View.MY_RELEASES: return <MyReleases releases={releases} onViewDashboard={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} onEditRelease={(r) => { setReleaseToEdit(r); setView(View.FORM); }} />;
        case View.DASHBOARD: return currentRelease ? <Dashboard release={currentRelease} onBackToReleases={() => setView(View.MY_RELEASES)} /> : null;
        case View.TICKETS: return <Tickets tickets={tickets} currentUser={currentUser} onCreateTicket={(s, c, m) => FirebaseService.createTicket({userId: currentUser.id, userName: currentUser.name, subject: s, category: c, messages: [{text: m, senderId: currentUser.id, senderName: currentUser.name, date: new Date().toISOString()}], status: 'Open'})} onReplyTicket={() => {}} onMarkAsRead={() => {}} />;
        default: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
    }
  }

  if (currentUser) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar currentUser={currentUser} currentView={view} onChangeView={setView} onLogout={handleLogout} tickets={tickets} onCreateRelease={() => setView(View.FORM)} />
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          <div key={view} className="animate-fadeIn">{renderAuthView()}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Header onGoHome={() => setView(View.LANDING)} isAuthenticated={false} currentUser={null} onLoginClick={() => setView(View.LOGIN)} onLogout={handleLogout} onMyReleasesClick={() => {}} onAdminClick={() => {}} onPayoutsClick={() => {}} />
      <main className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <div key={view} className="animate-fadeIn">
          {view === View.LOGIN ? <Login onLogin={handleLogin} onSwitchToRegister={() => setView(View.REGISTER)} /> : 
           view === View.REGISTER ? <Register onRegister={handleRegister} onSwitchToLogin={() => setView(View.LOGIN)} /> : 
           <Hero onStartRelease={() => setView(View.LOGIN)} />}
        </div>
      </main>
    </div>
  );
};

export default App;
