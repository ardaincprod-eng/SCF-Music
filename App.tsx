import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { ReleaseForm } from './components/ReleaseForm.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Login } from './components/Login.tsx';
import { Register } from './components/Register.tsx';
import { MyReleases } from './components/MyReleases.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Payouts } from './components/Payouts.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { Artists } from './components/Artists.tsx';
import { Tickets } from './components/Tickets.tsx';
import { Cards } from './components/Cards.tsx';
import { Tracks } from './components/Tracks.tsx';
import { Insights } from './components/Insights.tsx';
import { Release, View, User, Artist, Ticket } from './types.ts';
import { DataService } from './services/dataService.ts';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRelease, setCurrentRelease] = useState<Release | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedSession = localStorage.getItem('scf_auth_session');
        if (savedSession) {
          const user = JSON.parse(savedSession);
          // API hatası olsa bile kullanıcıyı artist rolüyle içeri al
          const role = await DataService.getUserRole(user.id).catch(() => 'artist');
          setCurrentUser({ ...user, role });
          setView(View.PROFILE);
        }
      } catch (err) {
        console.error("Uygulama başlatma hatası:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    const releaseSub = DataService.subscribeToReleases(
      setReleases, 
      currentUser.role === 'admin' ? undefined : currentUser.id
    );
    const artistSub = DataService.subscribeToArtists(currentUser.id, setArtists);
    
    const fetchTickets = async () => {
      try {
        const data = await DataService.getTickets(currentUser.role === 'admin' ? undefined : currentUser.id);
        if (data) setTickets(data);
      } catch (e) {
        console.warn("Biletler yüklenemedi");
      }
    };
    fetchTickets();

    return () => {
      if (releaseSub) releaseSub.unsubscribe();
      if (artistSub) artistSub.unsubscribe();
    };
  }, [currentUser]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const role = email.includes('admin') ? 'admin' : 'artist';
      const user: User = { id: btoa(email).slice(0, 10), name: email.split('@')[0].toUpperCase(), email, role };
      setCurrentUser(user);
      localStorage.setItem('scf_auth_session', JSON.stringify(user));
      await DataService.syncUserProfile(user);
      setView(View.PROFILE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('scf_auth_session');
    setCurrentUser(null);
    setView(View.LANDING);
  };

  const renderView = () => {
    if (!currentUser) {
      if (view === View.REGISTER) return <Register onRegister={async (n,e,p) => handleLogin(e,p)} onSwitchToLogin={() => setView(View.LOGIN)} />;
      if (view === View.LOGIN) return <Login onLogin={handleLogin} onSwitchToRegister={() => setView(View.REGISTER)} />;
      return <Hero onStartRelease={() => setView(View.LOGIN)} />;
    }

    switch (view) {
      case View.PROFILE: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
      case View.FORM: return <ReleaseForm onSubmit={async (d) => { await DataService.createRelease(currentUser.id, d); setView(View.MY_RELEASES); }} existingArtists={artists} />;
      case View.MY_RELEASES: return <MyReleases releases={releases} onViewDashboard={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
      case View.DASHBOARD: return currentRelease ? <Dashboard release={currentRelease} onBackToReleases={() => setView(View.MY_RELEASES)} /> : null;
      case View.ARTISTS: return <Artists artists={artists} onAddArtist={(a) => DataService.addArtist(currentUser.id, a)} onDeleteArtist={() => {}} />;
      case View.PAYOUTS: return <Payouts releases={releases} />;
      case View.CARDS: return <Cards userId={currentUser.id} />;
      case View.TRACKS: return <Tracks releases={releases} />;
      case View.INSIGHTS: return <Insights releases={releases} />;
      case View.TICKETS: return <Tickets tickets={tickets} currentUser={currentUser} onCreateTicket={async (s,c,m) => { await DataService.createTicket(currentUser.id, currentUser.name, s, c, m); }} onReplyTicket={async (tid, msg) => { await DataService.replyTicket(tid, currentUser.id, currentUser.name, msg, currentUser.role === 'admin'); }} onMarkAsRead={() => {}} />;
      case View.ADMIN: return <AdminDashboard releases={releases} users={[]} tickets={tickets} onApprove={() => {}} onReject={() => {}} onUpdateFinancials={() => {}} onUpdateUser={() => {}} onReplyTicket={() => {}} onUpdateTicketStatus={() => {}} onMarkAsRead={() => {}} onBanUser={() => {}} />;
      default: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">SCF Music Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200">
      {currentUser ? (
        <div className="flex">
          <Sidebar currentUser={currentUser} currentView={view} onChangeView={setView} onLogout={handleLogout} tickets={tickets} onCreateRelease={() => setView(View.FORM)} />
          <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">{renderView()}</div>
          </main>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <Header onGoHome={() => setView(View.LANDING)} isAuthenticated={false} currentUser={null} onLoginClick={() => setView(View.LOGIN)} onLogout={handleLogout} onMyReleasesClick={() => {}} onAdminClick={() => {}} onPayoutsClick={() => {}} />
          <div className="pt-10 px-4">{renderView()}</div>
        </div>
      )}
    </div>
  );
};

export default App;