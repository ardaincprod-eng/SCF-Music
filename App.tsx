
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
import { Tickets } from './components/Tickets';
import { Release, View, User, Artist, Ticket } from './types';
import { DataService } from './services/dataService';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRelease, setCurrentRelease] = useState<Release | null>(null);
  const [releaseToEdit, setReleaseToEdit] = useState<Release | null>(null);

  // Uygulama Başlatma: Oturum Kontrolü
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        const savedSession = localStorage.getItem('scf_auth_session');
        if (savedSession) {
          const user = JSON.parse(savedSession);
          // Rolü Neon'dan doğrula
          const role = await DataService.getUserRole(user.id);
          const updatedUser = { ...user, role };
          setCurrentUser(updatedUser);
          setView(View.PROFILE);
          console.log("SCF Music: Oturum geri yüklendi.");
        }
      } catch (err) {
        console.error("Başlatma hatası:", err);
        localStorage.removeItem('scf_auth_session');
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  // Veri Abonelikleri
  useEffect(() => {
    if (!currentUser) return;
    
    const releaseSub = DataService.subscribeToReleases(
      setReleases, 
      currentUser.role === 'admin' ? undefined : currentUser.id
    );
    const artistSub = DataService.subscribeToArtists(currentUser.id, setArtists);
    
    return () => {
      releaseSub.unsubscribe();
      artistSub.unsubscribe();
    };
  }, [currentUser]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Netlify Functions'a login isteği gönderilebilir. 
      // Şimdilik client-side simülasyon yapıyoruz.
      const user: User = {
        id: btoa(email).slice(0, 10), // Basit benzersiz ID
        name: email.split('@')[0],
        email,
        password: '',
        role: email.includes('admin') ? 'admin' : 'artist'
      };
      
      setCurrentUser(user);
      localStorage.setItem('scf_auth_session', JSON.stringify(user));
      await DataService.syncUserProfile(user);
      setView(View.PROFILE);
    } catch (err: any) {
      alert("Giriş hatası: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('scf_auth_session');
    setCurrentUser(null);
    setView(View.LANDING);
  };

  const handleReleaseSubmit = async (releaseData: any) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await DataService.createRelease(currentUser.id, releaseData);
      setView(View.MY_RELEASES);
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin relative z-10"></div>
        </div>
        <p className="mt-8 text-indigo-400 font-bold tracking-[0.3em] uppercase text-[10px] animate-pulse">SCF Music • Neon DB</p>
      </div>
    );
  }

  const renderView = () => {
    if (!currentUser) {
      switch (view) {
        case View.LOGIN: return <Login onLogin={handleLogin} onSwitchToRegister={() => setView(View.REGISTER)} />;
        case View.REGISTER: return <Register onRegister={async (n,e,p) => handleLogin(e,p)} onSwitchToLogin={() => setView(View.LOGIN)} />;
        default: return <Hero onStartRelease={() => setView(View.LOGIN)} />;
      }
    }

    switch (view) {
      case View.PROFILE: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
      case View.FORM: return <ReleaseForm onSubmit={handleReleaseSubmit} existingArtists={artists} releaseToEdit={releaseToEdit} />;
      case View.MY_RELEASES: return <MyReleases releases={releases} onViewDashboard={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} onEditRelease={(r) => { setReleaseToEdit(r); setView(View.FORM); }} />;
      case View.DASHBOARD: return currentRelease ? <Dashboard release={currentRelease} onBackToReleases={() => setView(View.MY_RELEASES)} /> : null;
      case View.ARTISTS: return <Artists artists={artists} onAddArtist={(a) => DataService.addArtist(currentUser.id, a)} onDeleteArtist={() => {}} />;
      case View.PAYOUTS: return <Payouts releases={releases} />;
      case View.ADMIN: return currentUser.role === 'admin' ? <AdminDashboard releases={releases} users={[]} tickets={[]} onApprove={() => {}} onReject={() => {}} onUpdateFinancials={() => {}} onUpdateUser={() => {}} onReplyTicket={() => {}} onUpdateTicketStatus={() => {}} onMarkAsRead={() => {}} onBanUser={() => {}} /> : null;
      default: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-200">
      {currentUser ? (
        <div className="flex">
          <Sidebar currentUser={currentUser} currentView={view} onChangeView={setView} onLogout={handleLogout} tickets={[]} onCreateRelease={() => setView(View.FORM)} />
          <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 min-h-screen overflow-x-hidden">
            <div className="max-w-7xl mx-auto animate-fadeIn">{renderView()}</div>
          </main>
        </div>
      ) : (
        <>
          <Header onGoHome={() => setView(View.LANDING)} isAuthenticated={false} currentUser={null} onLoginClick={() => setView(View.LOGIN)} onLogout={handleLogout} onMyReleasesClick={() => {}} onAdminClick={() => {}} onPayoutsClick={() => {}} />
          <div className="pt-10 px-4">{renderView()}</div>
        </>
      )}
    </div>
  );
};

export default App;
