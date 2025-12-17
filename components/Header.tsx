import React from 'react';
import { User } from '../types';

interface HeaderProps {
    onGoHome: () => void;
    isAuthenticated: boolean;
    currentUser: User | null;
    onLoginClick: () => void;
    onLogout: () => void;
    onMyReleasesClick: () => void;
    onAdminClick: () => void;
    onPayoutsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, isAuthenticated, currentUser, onLoginClick }) => {
  // If authenticated, we use the Sidebar, so we don't render this header usually.
  // However, for consistency with the Landing Page view when logged out:
  if (isAuthenticated) return null;

  return (
    <header className="bg-slate-950/70 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div 
            className="flex items-center cursor-pointer group"
            onClick={onGoHome}
          >
             <h1 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">SCF Music</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <button onClick={onLoginClick} className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 text-sm">
                Login
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};