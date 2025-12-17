import React, { useState } from 'react';
import { Artist } from '../types';
import { MicrophoneIcon, PlusIcon, TrashIcon, ExclamationIcon, UserIcon } from './icons/Icons';

interface ArtistsProps {
    artists: Artist[];
    onAddArtist: (artist: Omit<Artist, 'id'>) => void;
    onDeleteArtist: (id: string) => void;
}

export const Artists: React.FC<ArtistsProps> = ({ artists, onAddArtist, onDeleteArtist }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [spotifyUrl, setSpotifyUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');

    const MAX_ARTISTS = 3;
    const canAddMore = artists.length < MAX_ARTISTS;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        onAddArtist({
            name,
            spotifyUrl,
            instagramUrl
        });

        // Reset form
        setName('');
        setSpotifyUrl('');
        setInstagramUrl('');
        setIsAdding(false);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        My Artists
                    </h2>
                    <p className="text-slate-400 mt-2">Manage the artists profiles you distribute for.</p>
                </div>
                <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-white/10 flex items-center">
                    <span className={`text-xl font-bold ${artists.length >= MAX_ARTISTS ? 'text-red-400' : 'text-green-400'}`}>
                        {artists.length}
                    </span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-slate-400">{MAX_ARTISTS}</span>
                    <span className="ml-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">Slots Used</span>
                </div>
            </div>

            {/* Alert if limit reached */}
            {!canAddMore && !isAdding && (
                <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center text-yellow-200">
                    <ExclamationIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <p>You have reached the maximum limit of {MAX_ARTISTS} artists for this account plan.</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Existing Artists Cards */}
                {artists.map((artist) => (
                    <div key={artist.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative group hover:border-purple-500/30 transition-all">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onDeleteArtist(artist.id)}
                                className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete Artist"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                            <span className="text-2xl font-bold text-white">{artist.name.charAt(0).toUpperCase()}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-1">{artist.name}</h3>
                        <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider">Artist ID: {artist.id.slice(-6)}</p>

                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-slate-400 bg-slate-950/30 p-2 rounded-lg border border-white/5">
                                <MicrophoneIcon className="h-4 w-4 mr-2 text-green-400" />
                                <span className="truncate">{artist.spotifyUrl || <span className="text-slate-600 italic">No Spotify URL</span>}</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-400 bg-slate-950/30 p-2 rounded-lg border border-white/5">
                                <UserIcon className="h-4 w-4 mr-2 text-pink-400" />
                                <span className="truncate">{artist.instagramUrl || <span className="text-slate-600 italic">No Instagram</span>}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Artist Card / Form */}
                {isAdding ? (
                     <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-slate-800/20 border-2 border-dashed border-purple-500/50 rounded-2xl p-6 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-white mb-4">Add New Artist</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 font-medium ml-1">Artist Name *</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none mt-1"
                                    placeholder="e.g. The Weeknd"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 font-medium ml-1">Spotify URL</label>
                                <input 
                                    type="text" 
                                    value={spotifyUrl}
                                    onChange={(e) => setSpotifyUrl(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none mt-1"
                                    placeholder="https://open.spotify.com/..."
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 font-medium ml-1">Instagram Handle</label>
                                <input 
                                    type="text" 
                                    value={instagramUrl}
                                    onChange={(e) => setInstagramUrl(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none mt-1"
                                    placeholder="@username"
                                />
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg transition-colors text-sm">Save</button>
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 rounded-lg transition-colors text-sm">Cancel</button>
                            </div>
                        </form>
                     </div>
                ) : (
                    canAddMore && (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="h-full min-h-[300px] border-2 border-dashed border-slate-700 hover:border-purple-500 hover:bg-slate-800/30 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-purple-400 transition-all group"
                        >
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                <PlusIcon className="h-8 w-8" />
                            </div>
                            <span className="font-bold text-lg">Add Artist</span>
                            <span className="text-sm opacity-60 mt-1">{MAX_ARTISTS - artists.length} slots remaining</span>
                        </button>
                    )
                )}
            </div>
        </div>
    );
};