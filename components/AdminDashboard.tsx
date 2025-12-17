// ... (imports remain the same)
import React, { useState, useEffect, useRef } from 'react';
import { Release, ReleaseStatus, User, Ticket, TicketMessage } from '../types';
import { ClockIcon, ShieldCheckIcon, XCircleIcon, CheckCircleIcon, TrashIcon, CurrencyDollarIcon, XIcon, SaveIcon, UserIcon, PencilIcon, InformationCircleIcon, TicketIcon, ArrowLeftIcon, BanIcon } from './icons/Icons';

// ... (interfaces and helper functions remain the same)

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

const StatusBadge: React.FC<{ status: ReleaseStatus }> = ({ status }) => {
    const baseClasses = "flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm";
    switch (status) {
      case ReleaseStatus.APPROVED:
        return <div className={`${baseClasses} bg-green-500/10 border-green-500/30 text-green-300`}><ShieldCheckIcon className="h-4 w-4" /><span>Approved</span></div>;
      case ReleaseStatus.REJECTED:
        return <div className={`${baseClasses} bg-red-500/10 border-red-500/30 text-red-300`}><XCircleIcon className="h-4 w-4" /><span>Rejected</span></div>;
      case ReleaseStatus.PENDING_APPROVAL:
      default:
        return <div className={`${baseClasses} bg-yellow-500/10 border-yellow-500/30 text-yellow-300`}><ClockIcon className="h-4 w-4" /><span>Pending</span></div>;
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ releases, users, tickets, onApprove, onReject, onUpdateFinancials, onUpdateUser, onReplyTicket, onUpdateTicketStatus, onMarkAsRead, onBanUser }) => {
  // Sort pending releases by oldest submission first (FIFO)
  const pendingReleases = releases
    .filter(r => r.status === ReleaseStatus.PENDING_APPROVAL)
    .sort((a,b) => new Date(a.submissionDate || 0).getTime() - new Date(b.submissionDate || 0).getTime());

  const reviewedReleases = [...releases.filter(r => r.status !== ReleaseStatus.PENDING_APPROVAL)].sort((a,b) => (b.statusUpdateDate || '').localeCompare(a.statusUpdateDate || ''));
  
  // Sort all releases by newest submission first for main table
  const allReleasesSorted = [...releases].sort((a, b) => 
    new Date(b.submissionDate || 0).getTime() - new Date(a.submissionDate || 0).getTime()
  );

  // State for Royalty Editing Modal
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [editStreams, setEditStreams] = useState('');
  const [editRevenue, setEditRevenue] = useState('');

  // State for User Editing Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'artist' | 'admin'>('artist');

  // State for View Details Modal
  const [viewingRelease, setViewingRelease] = useState<Release | null>(null);

  // State for Ticket Management
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewingTicket) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [viewingTicket]);

  useEffect(() => {
      if (viewingTicket) {
          const updated = tickets.find(t => t.id === viewingTicket.id);
          if (updated) setViewingTicket(updated);
      }
  }, [tickets, viewingTicket]);

  // Mark as read when viewing a ticket
  useEffect(() => {
      if (viewingTicket && !viewingTicket.readByAdmin) {
          onMarkAsRead(viewingTicket.id);
      }
  }, [viewingTicket, onMarkAsRead]);

  const openRoyaltyEditor = (release: Release) => {
      setEditingRelease(release);
      setEditStreams(release.streams?.toString() || '0');
      setEditRevenue(release.revenue?.toString() || '0');
  };

  const closeRoyaltyEditor = () => {
      setEditingRelease(null);
  };

  const saveRoyalties = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingRelease) {
          onUpdateFinancials(
              editingRelease.id, 
              parseInt(editStreams) || 0, 
              parseFloat(editRevenue) || 0
          );
          closeRoyaltyEditor();
      }
  };

  // User Management Functions
  const openUserEditor = (user: User) => {
      setEditingUser(user);
      setEditUserName(user.name);
      setEditUserEmail(user.email);
      setEditUserRole(user.role);
  }

  const closeUserEditor = () => {
      setEditingUser(null);
  }

  const saveUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser) {
          onUpdateUser({
              ...editingUser,
              name: editUserName,
              email: editUserEmail,
              role: editUserRole
          });
          closeUserEditor();
      }
  }

  // View Details Functions
  const openDetailsModal = (release: Release) => {
      setViewingRelease(release);
  }

  const closeDetailsModal = () => {
      setViewingRelease(null);
  }
  
  // Ticket Functions
  const handleAdminReply = (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminReply.trim() || !viewingTicket) return;
      onReplyTicket(viewingTicket.id, adminReply);
      setAdminReply('');
  }

  const getTicketStatusBadge = (status: string) => {
    switch(status) {
        case 'Open': return <span className="flex items-center text-xs font-bold text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-full"><ClockIcon className="h-3 w-3 mr-1" /> Open</span>;
        case 'Resolved': return <span className="flex items-center text-xs font-bold text-green-300 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1" /> Resolved</span>;
        case 'Closed': return <span className="flex items-center text-xs font-bold text-slate-400 bg-slate-500/10 border border-slate-500/30 px-2 py-1 rounded-full"><XCircleIcon className="h-3 w-3 mr-1" /> Closed</span>;
        default: return null;
    }
  };
    
  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-12 relative">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400">Admin Dashboard</h2>
        <p className="text-slate-400 mt-2">Review and manage all user submissions.</p>
      </div>

      {/* ROYALTY EDITOR MODAL */}
      {editingRelease && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                  <button onClick={closeRoyaltyEditor} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <XIcon className="h-6 w-6" />
                  </button>
                  <h3 className="text-2xl font-bold text-white mb-1">Edit Earnings</h3>
                  <p className="text-sm text-slate-400 mb-6">Update stats for: <span className="text-cyan-400">{editingRelease.songTitle}</span></p>
                  
                  <form onSubmit={saveRoyalties} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Total Streams</label>
                          <input 
                            type="number" 
                            value={editStreams} 
                            onChange={(e) => setEditStreams(e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Total Revenue ($)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-500">$</span>
                            <input 
                                type="number" 
                                step="0.01"
                                value={editRevenue} 
                                onChange={(e) => setEditRevenue(e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" 
                            />
                          </div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                          <button type="button" onClick={closeRoyaltyEditor} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center">
                              <SaveIcon className="h-4 w-4 mr-2" /> Save
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* USER EDITOR MODAL */}
      {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                  <button onClick={closeUserEditor} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <XIcon className="h-6 w-6" />
                  </button>
                  <h3 className="text-2xl font-bold text-white mb-1">Edit User</h3>
                  <p className="text-sm text-slate-400 mb-6">Update details for: <span className="text-purple-400">{editingUser.name}</span></p>
                  
                  <form onSubmit={saveUser} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={editUserName} 
                            onChange={(e) => setEditUserName(e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                            required
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={editUserEmail} 
                            onChange={(e) => setEditUserEmail(e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                            required
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                          <select 
                            value={editUserRole} 
                            onChange={(e) => setEditUserRole(e.target.value as 'artist' | 'admin')} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                          >
                              <option value="artist">Artist</option>
                              <option value="admin">Admin</option>
                          </select>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                          <button type="button" onClick={closeUserEditor} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center">
                              <SaveIcon className="h-4 w-4 mr-2" /> Save Changes
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* TICKET CONVERSATION MODAL */}
      {viewingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-0 max-w-4xl w-full h-[80vh] shadow-2xl relative flex flex-col overflow-hidden">
                  <div className="bg-slate-950 p-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center">
                             <TicketIcon className="h-5 w-5 mr-3 text-indigo-400" />
                             <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                    {viewingTicket.subject} 
                                    {getTicketStatusBadge(viewingTicket.status)}
                                </h3>
                                <p className="text-xs text-slate-500">From: {viewingTicket.userName} ({viewingTicket.userId})</p>
                             </div>
                        </div>
                        <button onClick={() => setViewingTicket(null)} className="text-slate-400 hover:text-white">
                             <XIcon className="h-6 w-6" />
                        </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
                        {viewingTicket.messages.map((msg, idx) => {
                            const isAdmin = msg.isAdmin;
                            return (
                                <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[80%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                            {isAdmin ? <ShieldCheckIcon className="h-4 w-4 text-white" /> : <UserIcon className="h-4 w-4 text-slate-300" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl ${isAdmin ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                            <div className="text-xs opacity-50 mb-1 flex justify-between gap-4">
                                                <span className="font-bold">{msg.senderName}</span>
                                                <span>{new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 bg-slate-950 border-t border-white/10">
                      <div className="flex items-center justify-between mb-3 text-xs">
                          <span className="text-slate-500">Actions:</span>
                          <div className="flex gap-2">
                                <button onClick={() => onUpdateTicketStatus(viewingTicket.id, 'Open')} className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded hover:bg-yellow-500/20">Mark Open</button>
                                <button onClick={() => onUpdateTicketStatus(viewingTicket.id, 'Resolved')} className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded hover:bg-green-500/20">Mark Resolved</button>
                                <button onClick={() => onUpdateTicketStatus(viewingTicket.id, 'Closed')} className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded hover:bg-slate-500/20">Close Ticket</button>
                          </div>
                      </div>
                      <form onSubmit={handleAdminReply} className="flex gap-4">
                            <input
                                type="text"
                                value={adminReply}
                                onChange={(e) => setAdminReply(e.target.value)}
                                placeholder="Reply as Admin..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button 
                                type="submit"
                                disabled={!adminReply.trim()}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors"
                            >
                                Send
                            </button>
                        </form>
                  </div>
              </div>
          </div>
      )}

      {/* RELEASE DETAILS MODAL */}
      {viewingRelease && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-3xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button onClick={closeDetailsModal} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <XIcon className="h-6 w-6" />
                  </button>
                  <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <InformationCircleIcon className="h-6 w-6 text-cyan-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Submission Details</h3>
                  </div>

                  <div className="space-y-6">
                      {/* Header Section */}
                      <div className="flex flex-col sm:flex-row gap-6 bg-slate-950/50 p-6 rounded-xl border border-white/5">
                          <img src={viewingRelease.artworkPreview} alt="Artwork" className="w-32 h-32 rounded-xl object-cover shadow-lg border border-white/10" />
                          <div className="flex-1">
                              <h4 className="text-2xl font-bold text-white mb-1">{viewingRelease.songTitle}</h4>
                              <p className="text-lg text-cyan-400 font-medium mb-3">{viewingRelease.artistName}</p>
                              
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-400">
                                  <div>
                                      <span className="text-slate-500 block text-xs uppercase tracking-wide">Genre</span>
                                      {viewingRelease.genre}
                                  </div>
                                  <div>
                                      <span className="text-slate-500 block text-xs uppercase tracking-wide">Release Date</span>
                                      {new Date(viewingRelease.releaseDate).toLocaleDateString()}
                                  </div>
                                  <div>
                                      <span className="text-slate-500 block text-xs uppercase tracking-wide">Submission Date</span>
                                      {viewingRelease.submissionDate ? new Date(viewingRelease.submissionDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                  {viewingRelease.pitchforkScore && (
                                      <div>
                                          <span className="text-slate-500 block text-xs uppercase tracking-wide">Pitchfork Score</span>
                                          <span className="text-red-400 font-bold">{viewingRelease.pitchforkScore}</span>
                                      </div>
                                  )}
                                  <div className="col-span-2 mt-2 pt-2 border-t border-white/5">
                                      <span className="text-slate-500 block text-xs uppercase tracking-wide">User ID</span>
                                      <span className="font-mono text-xs">{viewingRelease.userId}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                          {/* Copyright & Credits */}
                          <div className="bg-slate-800/20 p-5 rounded-xl border border-white/5 space-y-4">
                                <h5 className="text-sm font-bold text-white flex items-center">
                                    <ShieldCheckIcon className="h-4 w-4 mr-2 text-purple-400" />
                                    Copyright & Publishing
                                </h5>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Copyright (C) Line</p>
                                        <p className="text-slate-200">© {viewingRelease.copyrightYear} {viewingRelease.copyrightHolder}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Publishing (P) Line</p>
                                        <p className="text-slate-200">℗ {viewingRelease.publishingYear} {viewingRelease.publishingHolder}</p>
                                    </div>
                                    <div className="pt-3 border-t border-white/5">
                                        <p className="text-xs text-slate-500 mb-0.5">Credits</p>
                                        <div className="grid grid-cols-1 gap-1">
                                            <p className="text-slate-300"><span className="text-slate-500">Composer:</span> {viewingRelease.composer || '-'}</p>
                                            <p className="text-slate-300"><span className="text-slate-500">Lyricist:</span> {viewingRelease.lyricist || '-'}</p>
                                            <p className="text-slate-300"><span className="text-slate-500">Producer:</span> {viewingRelease.producerCredits || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                          </div>

                          {/* Contact & Distribution */}
                          <div className="bg-slate-800/20 p-5 rounded-xl border border-white/5 space-y-4">
                                <h5 className="text-sm font-bold text-white flex items-center">
                                    <UserIcon className="h-4 w-4 mr-2 text-blue-400" />
                                    Contact & Services
                                </h5>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Contact Info</p>
                                        <p className="text-slate-300">{viewingRelease.contactEmail}</p>
                                        <p className="text-slate-300">{viewingRelease.supportPhone || 'No phone provided'}</p>
                                    </div>
                                    <div className="pt-3 border-t border-white/5">
                                        <p className="text-xs text-slate-500 mb-2">Selected Services</p>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingRelease.selectedServices.map(s => (
                                                <span key={s} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded border border-slate-600 capitalize">
                                                    {s.replace('-', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                          </div>
                      </div>

                      {/* Royalty Splits */}
                      <div className="bg-slate-800/20 p-5 rounded-xl border border-white/5">
                            <h5 className="text-sm font-bold text-white flex items-center mb-4">
                                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-green-400" />
                                Royalty Splits
                            </h5>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {viewingRelease.royaltySplits.map((split, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-900/40 px-4 py-3 rounded-lg border border-white/5">
                                        <div>
                                            <p className="text-sm font-bold text-white">{split.collaboratorName}</p>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">{split.role}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-green-400">{split.share}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                      </div>
                      
                  </div>
                  
                  <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-white/10">
                      <button onClick={closeDetailsModal} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                          Close Details
                      </button>
                      <button onClick={() => { onApprove(viewingRelease.id); closeDetailsModal(); }} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg shadow-green-900/20">
                          Approve Release
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* SECTION 1: DETAILED PENDING REVIEW */}
      <div>
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-2">
                <h3 className="text-2xl font-semibold text-white">Pending Review Queue <span className="text-cyan-400">({pendingReleases.length})</span></h3>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 p-6">
                {pendingReleases.length === 0 ? (
                <p className="text-center text-slate-500 py-6">No releases are currently pending review.</p>
                ) : (
                <div className="divide-y divide-white/5">
                    {pendingReleases.map(release => (
                    <div key={release.id} className="flex flex-col md:flex-row items-center justify-between py-6">
                        <div className="flex items-center space-x-5 mb-4 md:mb-0 text-left w-full md:w-3/4">
                            <img src={release.artworkPreview} alt={release.songTitle} className="w-20 h-20 object-cover rounded-lg shadow-lg border border-white/5 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-bold text-xl text-white">{release.songTitle}</p>
                                <p className="text-sm text-cyan-400 font-medium mb-1">{release.artistName}</p>
                                <div className="text-xs text-slate-500 flex items-center space-x-4">
                                    <span>Submitted: {formatDate(release.submissionDate)}</span>
                                    <span>•</span>
                                    <span>Release: {formatDate(release.releaseDate)}</span>
                                    <span>•</span>
                                    <span className="font-mono">ID: {release.userId}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 mt-4 md:mt-0 flex-shrink-0">
                            <button onClick={() => openDetailsModal(release)} className="px-4 py-2 text-sm font-bold bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-600/50 rounded-lg transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center">
                                <InformationCircleIcon className="h-4 w-4 mr-2" />
                                View Details
                            </button>
                            <button onClick={() => onApprove(release.id)} className="px-4 py-2 text-sm font-bold bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-600/50 rounded-lg transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                Approve
                            </button>
                            <button onClick={() => onReject(release.id)} className="px-4 py-2 text-sm font-bold bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-600/50 rounded-lg transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                Reject
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
        </div>

        {/* ... (rest of the file remains the same) ... */}
        {/* SECTION 2: TICKET MANAGEMENT */}
        <div id="ticketManagement" className="pt-12 border-t border-white/5">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-semibold text-white">Support Tickets</h3>
                    <p className="text-slate-400 text-sm mt-1">Manage and reply to user inquiries.</p>
                </div>
            </div>
            
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Details</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Last Update</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {tickets.length > 0 ? tickets.map((ticket) => (
                                <tr 
                                    key={ticket.id} 
                                    className={`hover:bg-white/5 transition-colors cursor-pointer ${!ticket.readByAdmin ? 'bg-indigo-500/5' : ''}`}
                                    onClick={() => setViewingTicket(ticket)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 relative">
                                                <TicketIcon className="h-5 w-5" />
                                                {!ticket.readByAdmin && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 translate-x-1/2 -translate-y-1/2"></span>}
                                            </div>
                                            <div className="ml-4">
                                                <div className={`text-sm font-bold ${!ticket.readByAdmin ? 'text-white' : 'text-slate-300'}`}>{ticket.subject}</div>
                                                <div className="text-xs text-slate-500">{ticket.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white">{ticket.userName}</div>
                                        <div className="text-xs text-slate-500 font-mono">{ticket.userId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {new Date(ticket.lastUpdated).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap flex justify-center">
                                        {getTicketStatusBadge(ticket.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setViewingTicket(ticket); }}
                                            className="text-indigo-400 hover:text-indigo-300 font-bold"
                                        >
                                            Open Chat
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No support tickets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* SECTION 3: RECENTLY REVIEWED */}
        <div>
             <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-2">
                <h3 className="text-2xl font-semibold text-white">Recently Reviewed <span className="text-slate-500">({reviewedReleases.length})</span></h3>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 p-6">
                {reviewedReleases.length > 0 && (
                     <div className="divide-y divide-white/5">
                        {reviewedReleases.map(release => (
                            <div key={release.id} className="flex items-center justify-between py-4 hover:bg-white/5 px-2 rounded-lg transition-colors">
                                <div className="flex items-center space-x-4">
                                    <img src={release.artworkPreview} alt={release.songTitle} className="w-12 h-12 object-cover rounded-md shadow-md" />
                                    <div>
                                        <p className="font-semibold text-white">{release.songTitle}</p>
                                        <p className="text-sm text-slate-400">{release.artistName}</p>
                                        {release.statusUpdateDate && <p className="text-xs text-slate-600 mt-1">Reviewed: {formatDate(release.statusUpdateDate)}</p>}
                                    </div>
                                </div>
                                <StatusBadge status={release.status} />
                            </div>
                        ))}
                    </div>
                )}
                {reviewedReleases.length === 0 && <p className="text-center text-slate-500 py-6">No history available.</p>}
            </div>
        </div>

        {/* SECTION 4: ALL USER RELEASES MANAGEMENT (TABLE VIEW) */}
        <div id="userReleases" className="pt-12 border-t border-white/5">
            <h3 className="text-2xl font-semibold text-white mb-6">User Releases Management</h3>
            <p className="text-slate-400 mb-6 -mt-4 text-sm">Master list of all releases submitted to the platform. You can change status and earnings.</p>
            
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Release Details</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User ID</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted / Release Date</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Earnings</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {allReleasesSorted.length > 0 ? allReleasesSorted.map((release) => (
                                <tr key={release.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-lg object-cover shadow-sm border border-white/5" src={release.artworkPreview} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-white">{release.songTitle}</div>
                                                <div className="text-xs text-slate-400">{release.artistName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                        {release.userId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">{formatDate(release.submissionDate)}</div>
                                        <div className="text-xs text-slate-500">Target: {formatDate(release.releaseDate)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap flex justify-center">
                                        <StatusBadge status={release.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-slate-300">
                                        {release.status === ReleaseStatus.APPROVED ? (
                                            <div>
                                                <div className="text-green-400 font-bold">${(release.revenue || 0).toLocaleString()}</div>
                                                <div className="text-xs text-slate-500">{(release.streams || 0).toLocaleString()} streams</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button 
                                                onClick={() => openDetailsModal(release)}
                                                className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <InformationCircleIcon className="h-5 w-5" />
                                            </button>
                                            {release.status === ReleaseStatus.APPROVED && (
                                                 <button 
                                                    onClick={() => openRoyaltyEditor(release)}
                                                    className="text-yellow-400 hover:text-yellow-300 p-2 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                    title="Edit Earnings"
                                                >
                                                    <CurrencyDollarIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                            {release.status !== ReleaseStatus.APPROVED && (
                                                <button 
                                                    onClick={() => onApprove(release.id)}
                                                    className="text-green-400 hover:text-green-300 p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                            {release.status !== ReleaseStatus.REJECTED && (
                                                <button 
                                                    onClick={() => onReject(release.id)}
                                                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No releases found in the system.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};