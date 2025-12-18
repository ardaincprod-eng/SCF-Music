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

  // Oturum Kontrolü
  useEffect(() => {
    const saved = localStorage.getItem('scf_auth');
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      setView(View.PROFILE);
    }
    setIsLoading(false);
  }, []);

  // Veri Senkronizasyonu
  useEffect(() => {
    if (!currentUser) return;
    
    const releaseSub = DataService.subscribeToReleases(setReleases, currentUser.role === 'admin' ? undefined : currentUser.id);
    const artistSub = DataService.subscribeToArtists(currentUser.id, setArtists);
    
    // Biletleri periyodik kontrol et
    const tktInterval = setInterval(async () => {
        const data = await DataService.getTickets(currentUser.role === 'admin' ? undefined : currentUser.id);
        setTickets(data);
    }, 3000);

    return () => {
      releaseSub.unsubscribe();
      artistSub.unsubscribe();
      clearInterval(tktInterval);
    };
  }, [currentUser]);

  const handleLogin = async (email: string, password: string) => {
    const role = email.includes('admin') ? 'admin' : 'artist';
    const user: User = { 
        id: btoa(email).slice(0, 8), 
        name: email.split('@')[0].toUpperCase(), 
        email, 
        role 
    };
    setCurrentUser(user);
    localStorage.setItem('scf_auth', JSON.stringify(user));
    await DataService.syncUserProfile(user);
    setView(View.PROFILE);
  };

  const handleLogout = () => {
    localStorage.removeItem('scf_auth');
    setCurrentUser(null);
    setView(View.LANDING);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
      case View.TICKETS: return <Tickets tickets={tickets} currentUser={currentUser} onCreateTicket={(s,c,m) => DataService.createTicket(currentUser.id, currentUser.name, s, c, m)} onReplyTicket={(tid, msg) => DataService.replyTicket(tid, currentUser.id, currentUser.name, msg, currentUser.role === 'admin')} onMarkAsRead={() => {}} />;
      case View.ADMIN: return <AdminDashboard releases={releases} users={[]} tickets={tickets} onApprove={() => {}} onReject={() => {}} onUpdateFinancials={() => {}} onUpdateUser={() => {}} onReplyTicket={(tid, msg) => DataService.replyTicket(tid, currentUser.id, currentUser.name, msg, true)} onUpdateTicketStatus={() => {}} onMarkAsRead={() => {}} onBanUser={() => {}} />;
      default: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
    }
  };

  return (
    <div className="min-h-screen">
      {currentUser ? (
        <div className="flex">
          <Sidebar currentUser={currentUser} currentView={view} onChangeView={setView} onLogout={handleLogout} tickets={tickets} onCreateRelease={() => setView(View.FORM)} />
          <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 animate-fadeIn">{renderView()}</main>
        </div>
      ) : (
        <>
          <Header onGoHome={() => setView(View.LANDING)} isAuthenticated={false} currentUser={null} onLoginClick={() => setView(View.LOGIN)} onLogout={handleLogout} onMyReleasesClick={() => {}} onAdminClick={() => {}} onPayoutsClick={() => {}} />
          {renderView()}
        </>
      )}
    </div>
  );
};

export default App;