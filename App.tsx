
import React, { useState, useEffect } from 'react';
import { View, User, Release, Artist, Ticket } from './types';
import { DataService } from './services/dataService';
import { Hero } from './components/Hero';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { UserProfile } from './components/UserProfile';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ReleaseForm } from './components/ReleaseForm';
import { MyReleases } from './components/MyReleases';
import { Artists } from './components/Artists';
import { Payouts } from './components/Payouts';
import { Cards } from './components/Cards';
import { Tickets } from './components/Tickets';

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
          setReleases(userReleases);
          setArtists(userArtists);
        }
      } catch (err) {
        console.error("Auth init error", err);
      } finally {
        setIsLoading(false);
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
    setReleases(r);
    setArtists(a);
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
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-indigo-400 font-bold tracking-widest animate-pulse">SCF MUSIC</p>
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
      default: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={() => setView(View.MY_RELEASES)} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-200">
      {!currentUser && <Header onGoHome={() => setView(View.LANDING)} isAuthenticated={false} currentUser={null} onLoginClick={() => setView(View.LOGIN)} onLogout={handleLogout} onMyReleasesClick={() => {}} onAdminClick={() => {}} onPayoutsClick={() => {}} />}
      
      <div className={currentUser ? "flex" : ""}>
        {currentUser && <Sidebar currentUser={currentUser} currentView={view} onChangeView={setView} onLogout={handleLogout} onCreateRelease={() => setView(View.FORM)} />}
        <main className={currentUser ? "flex-1 ml-0 md:ml-64 p-6" : "container mx-auto"}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
