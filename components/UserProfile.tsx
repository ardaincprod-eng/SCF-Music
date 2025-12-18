
import React, { useRef } from 'react';
import { User, Release, ReleaseStatus } from '../types';
import { 
    PlusIcon, 
    MusicNoteIcon, 
    AlbumIcon, 
    MicrophoneIcon, 
    ChartBarIcon, 
    ExclamationIcon, 
    ClockIcon, 
    CurrencyDollarIcon, 
    BanknotesIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    PlayIcon,
    GlobeIcon,
    ShieldCheckIcon
} from './icons/Icons';

interface UserProfileProps {
    currentUser: User;
    releases: Release[];
    onCreateRelease: () => void;
    onViewRelease: (release: Release) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentUser, releases, onCreateRelease, onViewRelease }) => {
    
    const totalReleases = releases.length;
    const totalArtists = new Set(releases.map(r => r.artistName)).size;
    const totalRevenue = releases.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const totalStreams = releases.reduce((sum, r) => sum + (r.streams || 0), 0);

    const stats = [
        { label: 'Yayınlar', value: totalReleases, icon: AlbumIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Sanatçılar', value: totalArtists, icon: MicrophoneIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Toplam Dinlenme', value: totalStreams.toLocaleString(), icon: ChartBarIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Tahmini Kazanç', value: `${totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'USD' })}`, icon: CurrencyDollarIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Üst Karşılama */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 p-8 border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl rotate-3">
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Hoş geldin, {currentUser.name}!</h1>
                            <div className="flex items-center mt-1 space-x-3">
                                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                                    {currentUser.role === 'admin' ? 'Yönetici' : 'Sanatçı Hesabı'}
                                </span>
                                <span className="text-slate-500 text-xs flex items-center">
                                    <ShieldCheckIcon className="h-3 w-3 mr-1 text-emerald-500" />
                                    Hesap Doğrulandı
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onCreateRelease}
                        className="group relative flex items-center justify-center px-6 py-3 bg-white text-slate-950 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                        Yeni Yayın Oluştur
                    </button>
                </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Canlı Veri</span>
                        </div>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Aktif Yayınlar Karuseli */}
            {releases.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg font-bold text-white flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                            Son Yayınların
                        </h3>
                        <div className="flex space-x-2">
                            <button onClick={() => scroll('left')} className="p-2 bg-slate-900 border border-white/5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"><ArrowLeftIcon className="h-4 w-4" /></button>
                            <button onClick={() => scroll('right')} className="p-2 bg-slate-900 border border-white/5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"><ArrowRightIcon className="h-4 w-4" /></button>
                        </div>
                    </div>
                    
                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {releases.map(release => (
                            <div 
                                key={release.id}
                                onClick={() => onViewRelease(release)}
                                className="min-w-[240px] w-[240px] snap-start bg-slate-900/60 rounded-2xl p-4 border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer group/card"
                            >
                                <div className="relative aspect-square mb-4 overflow-hidden rounded-xl shadow-2xl">
                                    <img src={release.artworkPreview} alt={release.songTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="bg-white/10 p-4 rounded-full border border-white/20">
                                            <PlayIcon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10">
                                        {release.status}
                                    </div>
                                </div>
                                <h4 className="font-bold text-white truncate">{release.songTitle}</h4>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{release.artistName}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Boş Durum */}
            {releases.length === 0 && (
                <div className="bg-slate-900/20 border-2 border-dashed border-white/5 rounded-3xl py-20 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-500">
                        <MusicNoteIcon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Henüz bir yayın yok</h3>
                    <p className="text-slate-400 mt-2 max-w-sm">Müziğini dünyaya duyurmaya hazır mısın? İlk yayınını şimdi oluştur.</p>
                    <button 
                        onClick={onCreateRelease}
                        className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Başla
                    </button>
                </div>
            )}
        </div>
    );
};
