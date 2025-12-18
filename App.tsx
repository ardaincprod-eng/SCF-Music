
import React, { useState, useEffect } from 'react';

// --- Types ---
type View = 'landing' | 'login' | 'dashboard' | 'release';
interface User { email: string; id: string; }
interface Release { id: number; song_title: string; artist_name: string; created_at: string; }

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);

  // Auth check
  useEffect(() => {
    const saved = localStorage.getItem('musicana_auth');
    if (saved) {
      setUser(JSON.parse(saved));
      setView('dashboard');
    }
  }, []);

  // Fetch from Neon DB (via Netlify Functions)
  const fetchReleases = async (userId: string) => {
    try {
      const res = await fetch(`/.netlify/functions/getData?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setReleases(data);
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    }
  };

  useEffect(() => {
    if (user) fetchReleases(user.id);
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any).email.value;
    const userData = { email, id: btoa(email).slice(0, 8) };
    setUser(userData);
    localStorage.setItem('musicana_auth', JSON.stringify(userData));
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('musicana_auth');
    setUser(null);
    setView('landing');
  };

  // --- Components ---
  const Landing = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
      <h1 className="text-7xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-cyan-400">
        SCF MUSICANA
      </h1>
      <p className="text-slate-400 max-w-lg text-lg mb-10 leading-relaxed">
        Müziğinizi sınırların ötesine taşıyın. Spotify, Apple Music ve 150+ platformda yerinizi alın.
      </p>
      <button 
        onClick={() => setView('login')}
        className="px-10 py-4 bg-accent hover:bg-indigo-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(99,102,241,0.4)]"
      >
        Hemen Başla
      </button>
    </div>
  );

  const Login = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface/50 p-10 rounded-[2rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Sanatçı Girişi</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">E-POSTA ADRESİ</label>
            <input name="email" type="email" required className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-white" />
          </div>
          <button type="submit" className="w-full py-4 bg-accent rounded-xl font-bold text-white shadow-lg">Panele Eriş</button>
        </form>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-16">
        <div>
          <h2 className="text-3xl font-black text-white">Panel</h2>
          <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setView('release')} className="px-6 py-2 bg-accent rounded-lg font-bold text-sm">+ Yeni Yayın</button>
          <button onClick={handleLogout} className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg text-sm font-bold transition-all">Çıkış</button>
        </div>
      </header>

      <div className="grid gap-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Aktif Yayınlar (Neon DB)
        </h3>
        {releases.length === 0 ? (
          <div className="p-20 border border-dashed border-white/5 rounded-3xl text-center text-slate-600">
            Henüz veritabanında yayınlanan bir eseriniz bulunmuyor.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {releases.map(r => (
              <div key={r.id} className="bg-surface/40 p-6 rounded-2xl border border-white/5 hover:border-accent/30 transition-all flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-lg">{r.song_title}</h4>
                  <p className="text-sm text-slate-500">{r.artist_name}</p>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md uppercase tracking-tighter">Aktif</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-200">
      {view === 'landing' && <Landing />}
      {view === 'login' && <Login />}
      {view === 'dashboard' && <Dashboard />}
      {view === 'release' && (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Yayın Formu Hazırlanıyor...</p>
            <button onClick={() => setView('dashboard')} className="fixed top-8 left-8 text-slate-500">← Geri</button>
        </div>
      )}
      
      {/* Network Status */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/5 text-[10px] font-bold tracking-widest text-slate-500">
        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
        SCF NETWORK ONLINE
      </div>
    </div>
  );
}
