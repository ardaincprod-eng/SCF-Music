import React, { useRef } from 'react';
import { User, Release } from '../types.ts';
import { 
    PlusIcon, 
    MusicNoteIcon, 
    AlbumIcon, 
    MicrophoneIcon, 
    ChartBarIcon, 
    CurrencyDollarIcon, 
    ArrowLeftIcon,
    ArrowRightIcon,
    PlayIcon,
    ShieldCheckIcon
} from './icons/Icons.tsx';

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

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 p-8 border border-white/5">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Hoş geldin, {currentUser.name}!</h1>
                            <div className="flex items-center mt-1 space-x-3">
                                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                                    {currentUser.role === 'admin' ? 'Yönetici' : 'Sanatçı'}
                                </span>
                                <span className="text-slate-500 text-xs flex items-center">
                                    <ShieldCheckIcon className="h-3 w-3 mr-1 text-emerald-500" />
                                    Doğrulanmış Sanatçı
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onCreateRelease}
                        className="flex items-center justify-center px-6 py-3 bg-white text-slate-950 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Yeni Yayın Oluştur
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {releases.length === 0 ? (
                <div className="bg-slate-900/20 border-2 border-dashed border-white/5 rounded-3xl py-20 flex flex-col items-center justify-center text-center">
                    <MusicNoteIcon className="h-12 w-12 text-slate-500 mb-4" />
                    <h3 className="text-xl font-bold text-white">Henüz bir yayın yok</h3>
                    <p className="text-slate-400 mt-2">Müziğini dünyaya duyurmak için ilk adımını at.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {releases.map(release => (
                        <div key={release.id} onClick={() => onViewRelease(release)} className="cursor-pointer group">
                             <div className="aspect-square rounded-2xl overflow-hidden mb-3 border border-white/5 group-hover:border-indigo-500/50 transition-all">
                                 <img src={release.artworkPreview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             </div>
                             <h4 className="font-bold text-white truncate">{release.songTitle}</h4>
                             <p className="text-xs text-slate-500 truncate">{release.artistName}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};