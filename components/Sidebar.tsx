
import React from 'react';
import { View, User, Ticket } from '../types';
import { 
    HomeIcon, 
    MicrophoneIcon, 
    AlbumIcon, 
    MusicNoteIcon, 
    TapeIcon, 
    ChartBarIcon, 
    CurrencyDollarIcon, 
    CreditCardIcon, 
    UserIcon, 
    LogoutIcon,
    ShieldCheckIcon,
    TicketIcon,
    PlusIcon
} from './icons/Icons';

interface SidebarProps {
    currentUser: User;
    currentView: View;
    onChangeView: (view: View) => void;
    onLogout: () => void;
    tickets?: Ticket[];
    onCreateRelease: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentView, onChangeView, onLogout, tickets = [], onCreateRelease }) => {
    
    const unreadTicketCount = (tickets || []).filter(t => 
        t.userId === currentUser.id && !t.readByArtist
    ).length;

    const menuItems = [
        { id: View.PROFILE, label: 'Panel', icon: HomeIcon },
        { id: View.ARTISTS, label: 'Sanatçılar', icon: MicrophoneIcon }, 
        { id: View.MY_RELEASES, label: 'Yayınlar', icon: AlbumIcon },
        { id: View.PAYOUTS, label: 'Kazançlar', icon: CurrencyDollarIcon },
        { id: View.CARDS, label: 'Ödeme Bilgileri', icon: CreditCardIcon }, 
        { id: View.TICKETS, label: 'Destek', icon: TicketIcon, badge: unreadTicketCount },
    ];

    if (currentUser.role === 'admin') {
        menuItems.push({ id: View.ADMIN, label: 'Yönetim', icon: ShieldCheckIcon });
    }

    return (
        <aside className="w-64 bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col z-50">
            {/* Logo */}
            <div className="p-8">
                <div className="flex flex-col group cursor-pointer" onClick={() => onChangeView(View.PROFILE)}>
                    <span className="text-2xl font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors">SCF</span>
                    <span className="text-xs font-bold tracking-[0.4em] text-indigo-500 -mt-1">MUSIC</span>
                </div>
            </div>

            {/* Yeni Yayın Butonu */}
            <div className="px-6 mb-8">
                <button 
                    onClick={onCreateRelease}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 group"
                >
                    <PlusIcon className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                    Yeni Yayın
                </button>
            </div>

            {/* Menü */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onChangeView(item.id as View)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${currentView === item.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <item.icon className={`h-5 w-5 ${currentView === item.id ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                            <span className="font-bold text-sm">{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="bg-indigo-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Alt Kısım */}
            <div className="p-6 border-t border-white/5 bg-slate-900/20">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                        {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{currentUser.role}</p>
                    </div>
                </div>
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all text-sm font-bold"
                >
                    <LogoutIcon className="h-4 w-4" />
                    <span>Çıkış Yap</span>
                </button>
                
                {/* Neon Connection Indicator */}
                <div className="mt-4 flex items-center justify-center space-x-2 py-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Neon DB Bağlı</span>
                </div>
            </div>
        </aside>
    );
};
