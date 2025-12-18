
import React, { useState, useEffect } from 'react';
import { View, User, Release, Artist, Ticket } from './types.ts';
import { DataService } from './services/dataService.ts';
import { Hero } from './components/Hero.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { Login } from './components/Login.tsx';
import { Register } from './components/Register.tsx';
import { ReleaseForm } from './components/ReleaseForm.tsx';
import { MyReleases } from './components/MyReleases.tsx';
import { Artists } from './components/Artists.tsx';
import { Payouts } from './components/Payouts.tsx';
import { Cards } from './components/Cards.tsx';
import { Tickets } from './components/Tickets.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [releases, setReleases] = useState<Release[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedAuth = localStorage.getItem('scf_auth');
        if (savedAuth) {
          const user = JSON.parse(savedAuth);
          setCurrentUser(user);
          setView(View.PROFILE);
          
          const [userReleases, userArtists] = await Promise.all([
            DataService.getReleases(user.id),
            DataService.getArtists(user.id)
          ]);
          setReleases(userReleases || []);
          setArtists(userArtists || []);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 500); // Yumuşak geçiş
      }
    };
    initApp();
  }, []);

  const handleLogin = async (email: string) => {
    const user: User = {
      id: btoa(email).slice(0, 10),
      name: email.split('@')[0].toUpperCase(),
      email,
      role: email.includes('admin') ? 'admin' : 'artist'
    };
    setCurrentUser(user);
    localStorage.setItem('scf_auth', JSON.stringify(user));
    const [r, a] = await Promise.all([
        DataService.getReleases(user.id),
        DataService.getArtists(user.id)
    ]);
    setReleases(r || []);
    setArtists(a || []);
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
        <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
                <p className="text-indigo-400 font-black tracking-[0.3em] text-xl animate-pulse">SCF MUSIC</p>
                <p className="text-slate-600 text-[10px] mt-2 font-bold uppercase tracking-widest">scfmusic.com.tr Senkronize Ediliyor</p>
            </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!currentUser) {
      if (view === View.LOGIN) return <Login onLogin={handleLogin} onSwitchToRegister={() => setView(View.REGISTER)} />;
      if (view === View.REGISTER) return <Register onRegister={async (n,e) => handleLogin(e)} onSwitchToLogin={() => setView(View.LOGIN)} />;
      return <Hero onStartRelease={() => setView(View.LOGIN)} />;
    }

    switch (view) {
      case View.PROFILE: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={() => setView(View.MY_RELEASES)} />;
      case View.FORM: return <ReleaseForm onSubmit={async (d) => { await DataService.createRelease(currentUser.id, d); setReleases(await DataService.getReleases(currentUser.id)); setView(View.MY_RELEASES); }} existingArtists={artists} />;
      case View.MY_RELEASES: return <MyReleases releases={releases} onViewDashboard={() => {}} />;
      case View.ARTISTS: return <Artists artists={artists} onAddArtist={async (a) => { await DataService.addArtist(currentUser.id, a.name); setArtists(await DataService.getArtists(currentUser.id)); }} onDeleteArtist={() => {}} />;
      case View.PAYOUTS: return <Payouts releases={releases} />;
      case View.CARDS: return <Cards userId={currentUser.id} />;
      case View.TICKETS: return <Tickets tickets={[]} currentUser={currentUser} onCreateTicket={() => {}} onReplyTicket={() => {}} onMarkAsRead={() => {}} />;
      case View.ADMIN: return (
        <AdminDashboard 
            releases={releases} 
            users={[]} 
            tickets={[]} 
            onApprove={() => {}} 
            onReject={() => {}} 
            onUpdateFinancials={() => {}}
            onUpdateUser={() => {}}
            onReplyTicket={() => {}}
            onUpdateTicketStatus={() => {}}
            onMarkAsRead={() => {}}
            onBanUser={() => {}}
        />
      );
      default: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={() => setView(View.MY_RELEASES)} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-indigo-500/30">
      {!currentUser && (
        <Header 
          onGoHome={() => setView(View.LANDING)} 
          isAuthenticated={false} 
          currentUser={null} 
          onLoginClick={() => setView(View.LOGIN)} 
          onLogout={handleLogout} 
          onMyReleasesClick={() => {}} 
          onAdminClick={() => {}} 
          onPayoutsClick={() => {}} 
        />
      )}
      
      <div className={currentUser ? "flex" : ""}>
        {currentUser && (
          <Sidebar 
            currentUser={currentUser} 
            currentView={view} 
            onChangeView={setView} 
            onLogout={handleLogout} 
            onCreateRelease={() => setView(View.FORM)} 
          />
        )}
        <main className={currentUser ? "flex-1 ml-0 md:ml-64 p-4 md:p-8" : "container mx-auto px-4"}>
          {renderContent()}
        </main>
      </div>
      
      {/* Domain Status Indicator (Hidden on Landing) */}
      {currentUser && (
        <div className="fixed bottom-4 right-4 z-[60] bg-slate-900/80 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            scfmusic.com.tr LIVE
        </div>
      )}
    </div>
  );
};

export default App;
