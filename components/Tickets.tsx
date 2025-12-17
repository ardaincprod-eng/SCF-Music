import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, CheckCircleIcon, ClockIcon, XCircleIcon, TicketIcon, ArrowLeftIcon, UserIcon, ShieldCheckIcon } from './icons/Icons';
import { Ticket, User } from '../types';

interface TicketsProps {
    tickets: Ticket[];
    currentUser: User;
    onCreateTicket: (subject: string, category: string, message: string) => void;
    onReplyTicket: (ticketId: string, message: string) => void;
    onMarkAsRead: (ticketId: string) => void;
}

const CATEGORIES = ['General Inquiry', 'Distribution Issue', 'Financial / Royalties', 'Account Support', 'Copyright Claim'];

export const Tickets: React.FC<TicketsProps> = ({ tickets, currentUser, onCreateTicket, onReplyTicket, onMarkAsRead }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    
    // Create Form State
    const [newSubject, setNewSubject] = useState('');
    const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
    const [newMessage, setNewMessage] = useState('');

    // Reply State
    const [replyMessage, setReplyMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedTicket]);

    // When tickets update (e.g. reply sent), update the selected ticket view
    useEffect(() => {
        if (selectedTicket) {
            const updated = tickets.find(t => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    }, [tickets, selectedTicket]);

    // Mark as read when opening a ticket
    useEffect(() => {
        if (selectedTicket && !selectedTicket.readByArtist) {
            onMarkAsRead(selectedTicket.id);
        }
    }, [selectedTicket, onMarkAsRead]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateTicket(newSubject, newCategory, newMessage);
        setIsCreating(false);
        setNewSubject('');
        setNewMessage('');
        // Switch to list view is automatic as modal closes
    };

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket) return;
        onReplyTicket(selectedTicket.id, replyMessage);
        setReplyMessage('');
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Open': return <span className="flex items-center text-xs font-bold text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-full"><ClockIcon className="h-3 w-3 mr-1" /> Open</span>;
            case 'Resolved': return <span className="flex items-center text-xs font-bold text-green-300 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1" /> Resolved</span>;
            case 'Closed': return <span className="flex items-center text-xs font-bold text-slate-400 bg-slate-500/10 border border-slate-500/30 px-2 py-1 rounded-full"><XCircleIcon className="h-3 w-3 mr-1" /> Closed</span>;
            default: return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    // --- CONVERSATION VIEW ---
    if (selectedTicket) {
        return (
            <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
                <div className="flex items-center mb-6">
                    <button onClick={() => setSelectedTicket(null)} className="mr-4 p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            {selectedTicket.subject}
                            <span className="ml-4">{getStatusBadge(selectedTicket.status)}</span>
                        </h2>
                        <p className="text-slate-400 text-sm">Ticket ID: {selectedTicket.id} • {selectedTicket.category}</p>
                    </div>
                </div>

                <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {selectedTicket.messages.map((msg, idx) => {
                            const isMe = msg.senderId === currentUser.id;
                            const isAdmin = msg.isAdmin;
                            
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                            {isAdmin ? <ShieldCheckIcon className="h-4 w-4 text-white" /> : <UserIcon className="h-4 w-4 text-slate-300" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                            <div className="text-xs opacity-50 mb-1 flex justify-between gap-4">
                                                <span className="font-bold">{msg.senderName}</span>
                                                <span>{formatDate(msg.date)}</span>
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {selectedTicket.status !== 'Closed' && (
                        <div className="p-4 bg-slate-950/50 border-t border-white/5">
                            <form onSubmit={handleReplySubmit} className="flex gap-4">
                                <input
                                    type="text"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                <button 
                                    type="submit"
                                    disabled={!replyMessage.trim()}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                    {selectedTicket.status === 'Closed' && (
                         <div className="p-4 bg-slate-950/50 border-t border-white/5 text-center text-slate-500">
                             This ticket is closed. You cannot reply.
                         </div>
                    )}
                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
             <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Support Tickets
                    </h2>
                    <p className="text-slate-400 mt-2">Get help with your releases, account, or billing.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Open New Ticket
                </button>
            </div>

            {isCreating && (
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-fadeIn mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Create New Ticket</h3>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newSubject}
                                    onChange={e => setNewSubject(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="Brief summary of the issue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                <select 
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                >
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                            <textarea 
                                required
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 h-32"
                                placeholder="Describe your issue in detail..."
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button 
                                type="button" 
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors"
                            >
                                Submit Ticket
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Last Updated</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {tickets.length > 0 ? (
                                tickets.map((ticket) => (
                                    <tr 
                                        key={ticket.id} 
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`hover:bg-white/5 transition-colors cursor-pointer group ${!ticket.readByArtist ? 'bg-indigo-500/5' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono relative">
                                            {ticket.id}
                                            {!ticket.readByArtist && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-bold ${!ticket.readByArtist ? 'text-white' : 'text-slate-300'} group-hover:text-indigo-300 transition-colors`}>{ticket.subject}</div>
                                            <div className={`text-xs ${!ticket.readByArtist ? 'text-slate-300' : 'text-slate-500'} truncate max-w-xs`}>{ticket.messages[ticket.messages.length - 1]?.text}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-xs">
                                                {ticket.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {new Date(ticket.lastUpdated).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <TicketIcon className="h-12 w-12 opacity-20 mb-3" />
                                            <p>No tickets found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};