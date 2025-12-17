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
    
    // Calculate unread count
    const unreadTicketCount = tickets.filter(t => 
        t.userId === currentUser.id && !t.readByArtist
    ).length;

    const unreadAdminCount = currentUser.role === 'admin' 
        ? tickets.filter(t => !t.readByAdmin).length 
        : 0;

    const menuItems = [
        { id: View.PROFILE, label: 'Home', icon: HomeIcon },
        { id: View.ARTISTS, label: 'Artists', icon: MicrophoneIcon }, 
        { id: View.MY_RELEASES, label: 'Releases', icon: AlbumIcon },
        { id: View.TRACKS, label: 'Tracks', icon: MusicNoteIcon }, 
        { id: View.INSIGHTS, label: 'Insights', icon: ChartBarIcon },
        { id: View.PAYOUTS, label: 'Royalties', icon: CurrencyDollarIcon },
        { id: View.CARDS, label: 'Cards', icon: CreditCardIcon }, 
        { id: 'labels', label: 'Labels', icon: TapeIcon }, // Placeholder View
        { id: View.TICKETS, label: 'Support Tickets', icon: TicketIcon, badge: unreadTicketCount },
    ];

    // Add Admin item if user is admin, right after Cards
    if (currentUser.role === 'admin') {
        menuItems.push({ id: View.ADMIN, label: 'Admin', icon: ShieldCheckIcon, badge: unreadAdminCount });
    }

    const userItems = [
        { id: 'user_profile', label: currentUser.name, icon: UserIcon },
        { id: 'logout', label: 'Logout', icon: LogoutIcon, action: onLogout },
    ];

    return (
        <aside className="w-64 bg-slate-950 border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col z-50">
            {/* Logo Area */}
            <div className="p-6 border-b border-white/5">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tighter text-white">SCF</h1>
                    <h1 className="text-2xl font-bold tracking-tighter text-slate-400 -mt-2">RECORDS</h1>
                </div>
            </div>

            {/* Main Action Button */}
            <div className="px-4 pt-6 pb-2">
                <button 
                    onClick={onCreateRelease}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center transition-all transform hover:-translate-y-0.5 group"
                >
                    <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    New Release
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => item.id !== 'labels' ? onChangeView(item.id as View) : null}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === item.id ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center space-x-4">
                            <item.icon className={`h-5 w-5 ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-white/5">
                <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">USER</p>
                {userItems.map((item, idx) => (
                     <button
                        key={idx}
                        onClick={item.action}
                        className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-400 hover:text-white hover:bg-white/5`}
                    >
                        <item.icon className="h-5 w-5 text-slate-500 group-hover:text-slate-300" />
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.id === 'logout' && <span className="ml-auto text-xs opacity-50">→</span>}
                    </button>
                ))}
            </div>
        </aside>
    );
};