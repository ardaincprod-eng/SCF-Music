
import React, { useState } from 'react';
import { Release, ReleaseStatus, User, Ticket } from '../types.ts';
import { 
    GlobeIcon, 
    ShieldCheckIcon, 
    RefreshIcon, 
    CheckCircleIcon,
    InformationCircleIcon
} from './icons/Icons.tsx';

interface AdminDashboardProps {
  releases: Release[];
  users: User[];
  tickets: Ticket[];
  onApprove: (releaseId: string) => void;
  onReject: (releaseId: string) => void;
  onUpdateFinancials: (releaseId: string, streams: number, revenue: number) => void;
  onUpdateUser: (user: User) => void;
  onReplyTicket: (ticketId: string, message: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: 'Open' | 'Closed' | 'Resolved') => void;
  onMarkAsRead: (ticketId: string) => void;
  onBanUser: (userId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ releases }) => {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Sistem Yönetimi</h2>
                    <p className="text-slate-500 text-sm mt-1">SCF Music altyapı ve domain kontrol merkezi.</p>
                </div>
                <div className="flex gap-3">
                     <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
                        <GlobeIcon className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-400">scfmusic.com.tr Senkronize</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <ShieldCheckIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">Güvenli</span>
                    </div>
                    <h3 className="font-bold text-white">SSL Sertifikası</h3>
                    <p className="text-xs text-slate-500 mt-1">HTTPS protokolü aktif ve doğrulanmış.</p>
                </div>
                
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <RefreshIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase">Aktif</span>
                    </div>
                    <h3 className="font-bold text-white">Alan Adı Yönlendirme</h3>
                    <p className="text-xs text-slate-500 mt-1">WWW ve Root domain senkronizasyonu tamam.</p>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                            <CheckCircleIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Güncel</span>
                    </div>
                    <h3 className="font-bold text-white">Veritabanı Senkronu</h3>
                    <p className="text-xs text-slate-500 mt-1">Neon DB ile gerçek zamanlı veri akışı.</p>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <InformationCircleIcon className="h-6 w-6 text-indigo-400" />
                    <h3 className="text-xl font-bold text-white">Bekleyen Onaylar</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                    <p>Şu an için onay bekleyen yeni yayın bulunmamaktadır.</p>
                </div>
            </div>
        </div>
    );
};
