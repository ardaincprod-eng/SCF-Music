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
    PencilIcon,
    PhoneIcon,
    GlobeIcon,
    LockClosedIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    PlayIcon
} from './icons/Icons';

interface UserProfileProps {
    currentUser: User;
    releases: Release[];
    onCreateRelease: () => void;
    onViewRelease: (release: Release) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentUser, releases, onCreateRelease, onViewRelease }) => {
    
    // Calculate stats
    const totalReleases = releases.length;
    const totalTracks = releases.length; // Assuming 1 track per release for this demo
    const totalArtists = new Set(releases.map(r => r.artistName)).size;
    const totalRoyalties = releases.length * 450.25; // Dummy data calculation

    const stats = [
        { label: 'Releases', value: totalReleases, icon: AlbumIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Tracks', value: totalTracks, icon: MusicNoteIcon, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Artists', value: totalArtists, icon: MicrophoneIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Streams', value: totalReleases * 1250, icon: ChartBarIcon, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Takedowns', value: 0, icon: ExclamationIcon, color: 'text-red-400', bg: 'bg-red-500/10' },
        { label: 'Last Login', value: new Date().toLocaleDateString(), icon: ClockIcon, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Total Royalties', value: `${totalRoyalties.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`, icon: CurrencyDollarIcon, color: 'text-indigo-300', bg: 'bg-indigo-500/10' },
        { label: 'Payouts', value: '0,00€', icon: BanknotesIcon, color: 'text-purple-300', bg: 'bg-purple-500/10' },
    ];

    // Carousel Logic
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const currentScroll = scrollContainerRef.current.scrollLeft;
            scrollContainerRef.current.scrollTo({
                left: direction === 'right' ? currentScroll + scrollAmount : currentScroll - scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Determine featured releases (Prioritize approved, fall back to all if none approved)
    const approvedReleases = releases.filter(r => r.status === ReleaseStatus.APPROVED);
    const displayReleases = approvedReleases.length > 0 ? approvedReleases : releases;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-400">My Profile</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage your account information and settings</p>
                </div>
                <button 
                    onClick={onCreateRelease}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Release
                </button>
            </div>

            {/* Featured Releases Carousel */}
            {displayReleases.length > 0 && (
                <div className="relative group animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <span className="w-1.5 h-6 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full mr-3"></span>
                            Featured Releases
                        </h3>
                        <div className="flex space-x-2">
                            <button onClick={() => scroll('left')} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors border border-white/10 hover:border-white/20 text-slate-300"><ArrowLeftIcon className="h-4 w-4" /></button>
                            <button onClick={() => scroll('right')} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors border border-white/10 hover:border-white/20 text-slate-300"><ArrowRightIcon className="h-4 w-4" /></button>
                        </div>
                    </div>
                    
                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto space-x-5 pb-4 scrollbar-hide snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {displayReleases.map(release => (
                            <div 
                                key={release.id}
                                onClick={() => onViewRelease(release)}
                                className="min-w-[220px] w-[220px] snap-start bg-slate-900/40 rounded-2xl p-4 border border-white/5 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all cursor-pointer group/card flex flex-col shadow-lg"
                            >
                                <div className="relative aspect-square mb-4 overflow-hidden rounded-xl shadow-md">
                                    <img src={release.artworkPreview} alt={release.songTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-colors flex items-center justify-center">
                                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full opacity-0 group-hover/card:opacity-100 transform translate-y-4 group-hover/card:translate-y-0 transition-all duration-300 border border-white/20">
                                            <PlayIcon className="h-6 w-6 text-white ml-0.5" />
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                         {release.status === ReleaseStatus.APPROVED && (
                                            <div className="bg-green-500/80 backdrop-blur-sm p-1 rounded-full shadow-lg" title="Approved">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                         )}
                                    </div>
                                </div>
                                <h4 className="font-bold text-white truncate text-lg">{release.songTitle}</h4>
                                <p className="text-sm text-slate-400 truncate">{release.artistName}</p>
                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center text-xs text-slate-500">
                                     <span>{release.genre}</span>
                                     <span className="mx-2">•</span>
                                     <span>{new Date(release.releaseDate).getFullYear()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 text-slate-500 text-xs font-mono">
                    ID <br /> <span className="text-lg text-white font-bold">{Math.floor(Math.random() * 10000) + 10000}</span>
                </div>
                <div className="flex items-center space-x-6 relative z-10">
                    <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-slate-900">
                        {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
                        <p className="text-slate-400">{currentUser.email}</p>
                    </div>
                </div>
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                     <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center space-x-4 hover:bg-slate-800/50 transition-colors">
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Account Settings */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-6">Account Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                    {/* Email */}
                    <div className="group">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-sm font-medium text-slate-400">
                                <GlobeIcon className="h-4 w-4 mr-2" /> Email
                            </label>
                            <button className="text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-white font-medium pb-2 border-b border-white/5">{currentUser.email}</div>
                    </div>

                     {/* Phone */}
                     <div className="group">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-sm font-medium text-slate-400">
                                <PhoneIcon className="h-4 w-4 mr-2" /> Phone
                            </label>
                             <button className="text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-white font-medium pb-2 border-b border-white/5">Not set</div>
                    </div>

                    {/* Password */}
                    <div className="group">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-sm font-medium text-slate-400">
                                <LockClosedIcon className="h-4 w-4 mr-2" /> Password
                            </label>
                             <button className="text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-white font-medium pb-2 border-b border-white/5 text-2xl tracking-widest leading-3">••••••••</div>
                    </div>

                    {/* Language */}
                    <div className="group">
                         <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-sm font-medium text-slate-400">
                                Language
                            </label>
                        </div>
                        <div className="relative">
                            <select className="w-full bg-black/20 border border-white/10 rounded-lg text-white py-2 px-3 focus:outline-none focus:border-indigo-500">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>Turkish</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};