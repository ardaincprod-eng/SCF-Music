
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
import { Release, View, User, Artist, Ticket } from './types';
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

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (!supabase || !supabase.auth) {
          if (mounted) setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const session = data?.session;
        if (session?.user && mounted) {
          const role = await DataService.getUserRole(session.user.id);
          const user: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'Artist',
            email: session.user.email || '',
            password: '',
            role: role
          };
          setCurrentUser(user);
          await DataService.syncUserProfile(user);
        }
      } catch (err: any) {
        console.error("Auth initialization failed:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const authListener = supabase?.auth?.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user && mounted) {
        const role = await DataService.getUserRole(session.user.id);
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Artist',
          email: session.user.email || '',
          password: '',
          role: role
        };
        setCurrentUser(user);
        // Only switch view if we are on landing/login/register
        setView(prevView => {
           if ([View.LANDING, View.LOGIN, View.REGISTER].includes(prevView)) {
             return View.PROFILE;
           }
           return prevView;
        });
      } else if (mounted) {
        setCurrentUser(null);
        setView(prevView => {
           if (![View.LANDING, View.LOGIN, View.REGISTER].includes(prevView)) {
             return View.LANDING;
           }
           return prevView;
        });
      }
    });

    return () => {
      mounted = false;
      if (authListener?.data?.subscription) {
          authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    let releaseSub: any;
    let artistSub: any;
    try {
        releaseSub = DataService.subscribeToReleases(setReleases, currentUser.role === 'admin' ? undefined : currentUser.id);
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
    alert("Kayıt başarılı! Lütfen e-postanızı onaylayın.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setView(View.LANDING);
  };

  const handleReleaseSubmit = async (releaseData: any) => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      
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

      setReleaseToEdit(null);
      setView(View.MY_RELEASES);
    } catch (err: any) {
      alert("Yükleme hatası: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 relative z-10"></div>
        </div>
        <p className="mt-6 text-slate-400 font-medium tracking-widest uppercase text-xs animate-pulse">SCF Music Hazırlanıyor...</p>
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
    <div className="min-h-screen font-sans selection:bg-indigo-500/30">
      {currentUser ? (
        <div className="flex min-h-screen bg-slate-950">
          <Sidebar currentUser={currentUser} currentView={view} onChangeView={setView} onLogout={handleLogout} tickets={tickets} onCreateRelease={() => setView(View.FORM)} />
          <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
            <div key={view} className="animate-fadeIn max-w-7xl mx-auto">{renderAuthView()}</div>
          </main>
        </div>
      ) : (
        <div className="bg-slate-950 min-h-screen">
          <Header onGoHome={() => setView(View.LANDING)} isAuthenticated={false} currentUser={null} onLoginClick={() => setView(View.LOGIN)} onLogout={handleLogout} onMyReleasesClick={() => {}} onAdminClick={() => {}} onPayoutsClick={() => {}} />
          <main className="container mx-auto px-4 py-8 md:py-16 relative z-10">
            <div key={view} className="animate-fadeIn">
              {view === View.LOGIN ? <Login onLogin={handleLogin} onSwitchToRegister={() => setView(View.REGISTER)} /> : 
               view === View.REGISTER ? <Register onRegister={handleRegister} onSwitchToLogin={() => setView(View.LOGIN)} /> : 
               <Hero onStartRelease={() => setView(View.LOGIN)} />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
