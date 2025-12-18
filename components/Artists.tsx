import React, { useState } from 'react';
import { Artist } from '../types.ts';
import { MicrophoneIcon, PlusIcon, TrashIcon, ExclamationIcon, UserIcon } from './icons/Icons.tsx';

interface ArtistsProps {
    artists: Artist[];
    onAddArtist: (artist: Omit<Artist, 'id'>) => void;
    onDeleteArtist: (id: string) => void;
}

export const Artists: React.FC<ArtistsProps> = ({ artists, onAddArtist, onDeleteArtist }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        onAddArtist({ name, spotifyUrl: '', instagramUrl: '' });
        setName('');
        setIsAdding(false);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-white">Sanatçılarım</h2>
                <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all">
                    Yeni Sanatçı Ekle
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {artists.map(artist => (
                    <div key={artist.id} className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                        <div className="h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                            <UserIcon className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{artist.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">PRO ARTIST</p>
                    </div>
                ))}

                {isAdding && (
                    <div className="bg-slate-900/80 p-6 rounded-2xl border border-indigo-500/30">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sanatçı Adı" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" required />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-indigo-600 py-2 rounded-lg text-white font-bold">Kaydet</button>
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-700 py-2 rounded-lg text-white font-bold">İptal</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};