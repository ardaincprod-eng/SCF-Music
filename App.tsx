
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
import { Release, View, User, ReleaseStatus, Artist, Ticket } from './types';
import { DataService } from './services/dataService';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentRelease, setCurrentRelease] = useState<Release | null>(null);
  const [releaseToEdit, setReleaseToEdit] = useState<Release | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // 1. Supabase Auth Takibi
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!supabase || !supabase.auth) {
           console.error("Supabase client not found.");
           return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const session = data?.session;
        if (session?.user) {
          const role = await DataService.getUserRole(session.user.id);
          const user: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'Artist',
            email: session.user.email || '',
            password: '',
            role: role
          };
          setCurrentUser(user);
          DataService.syncUserProfile(user);
        }
      } catch (err: any) {
        console.error("Auth initialization failed:", err);
        // Do not block app for auth errors, just log them
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const authListener = supabase?.auth?.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const role = await DataService.getUserRole(session.user.id);
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Artist',
          email: session.user.email || '',
          password: '',
          role: role
        };
        setCurrentUser(user);
        if (view === View.LANDING || view === View.LOGIN || view === View.REGISTER) {
          setView(View.PROFILE);
        }
      } else {
        setCurrentUser(null);
        if (view !== View.LANDING && view !== View.LOGIN && view !== View.REGISTER) {
            setView(View.LANDING);
        }
      }
    });

    return () => {
      if (authListener?.data?.subscription) {
          authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  // 2. Veri Abonelikleri
  useEffect(() => {
    if (!currentUser) return;

    let releaseSub: any;
    let artistSub: any;

    try {
        releaseSub = DataService.subscribeToReleases(
          setReleases, 
          currentUser.role === 'admin' ? undefined : currentUser.id
        );
        artistSub = DataService.subscribeToArtists(currentUser.id, setArtists);
    } catch (err) {
        console.error("Data subscription error:", err);
    }

    return () => {
      if (releaseSub?.unsubscribe) releaseSub.unsubscribe();
      if (artistSub?.unsubscribe) artistSub.unsubscribe();
    };
  }, [currentUser]);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    alert("Kayıt başarılı! Lütfen e-posta adresinizi onaylayın.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setView(View.LANDING);
  };

  const handleReleaseSubmit = async (releaseData: any) => {
    if (!currentUser) return;

    let audioUrl = "";
    if (releaseData.audioFile) {
      audioUrl = await DataService.uploadFile(
        releaseData.audioFile, 
        'audio', 
        `${currentUser.id}/${Date.now()}_${releaseData.audioFile.name}`
      );
    }

    await DataService.createRelease(currentUser.id, {
      ...releaseData,
      audioUrl
    });

    setView(View.MY_RELEASES);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-400 font-medium animate-pulse">SCF Music Başlatılıyor...</p>
        </div>
      </div>
    );
  }

  const renderAuthView = () => {
    if (!currentUser) return null;
    switch(view) {
        case View.PROFILE: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
        case View.FORM: return <ReleaseForm onSubmit={handleReleaseSubmit} existingArtists={artists} releaseToEdit={releaseToEdit} />;
        case View.ARTISTS: return <Artists artists={artists} onAddArtist={(a) => DataService.addArtist(currentUser.id, a)} onDeleteArtist={() => {}} />;
        case View.MY_RELEASES: return <MyReleases releases={releases} onViewDashboard={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} onEditRelease={(r) => { setReleaseToEdit(r); setView(View.FORM); }} />;
        case View.DASHBOARD: return currentRelease ? <Dashboard release={currentRelease} onBackToReleases={() => setView(View.MY_RELEASES)} /> : null;
        case View.TICKETS: return <Tickets tickets={tickets} currentUser={currentUser} onCreateTicket={(s, c, m) => DataService.createTicket({userId: currentUser.id, subject: s, category: c, messages: [{text: m}]})} onReplyTicket={() => {}} onMarkAsRead={() => {}} />;
        case View.PAYOUTS: return <Payouts releases={releases} />;
        case View.ADMIN: return currentUser.role === 'admin' ? <AdminDashboard releases={releases} users={[]} tickets={tickets} onApprove={() => {}} onReject={() => {}} onUpdateFinancials={() => {}} onUpdateUser={() => {}} onReplyTicket={() => {}} onUpdateTicketStatus={() => {}} onMarkAsRead={() => {}} onBanUser={() => {}} /> : null;
        default: return <UserProfile currentUser={currentUser} releases={releases} onCreateRelease={() => setView(View.FORM)} onViewRelease={(r) => { setCurrentRelease(r); setView(View.DASHBOARD); }} />;
    }
  }

  return (
    <div className="min-h-screen font-sans">
      {currentUser ? (
        <div className="flex min-h-screen bg-slate-950">
          <Sidebar currentUser={currentUser} currentView={view} onChangeView={setView} onLogout={handleLogout} tickets={tickets} onCreateRelease={() => setView(View.FORM)} />
          <main className="flex-1 ml-64 p-8 overflow-y-auto">
            <div key={view} className="animate-fadeIn">{renderAuthView()}</div>
          </main>
        </div>
      ) : (
        <>
          <Header onGoHome={() => setView(View.LANDING)} isAuthenticated={false} currentUser={null} onLoginClick={() => setView(View.LOGIN)} onLogout={handleLogout} onMyReleasesClick={() => {}} onAdminClick={() => {}} onPayoutsClick={() => {}} />
          <main className="container mx-auto px-4 py-8 md:py-16 relative z-10">
            <div key={view} className="animate-fadeIn">
              {view === View.LOGIN ? <Login onLogin={handleLogin} onSwitchToRegister={() => setView(View.REGISTER)} /> : 
               view === View.REGISTER ? <Register onRegister={handleRegister} onSwitchToLogin={() => setView(View.LOGIN)} /> : 
               <Hero onStartRelease={() => setView(View.LOGIN)} />}
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default App;
