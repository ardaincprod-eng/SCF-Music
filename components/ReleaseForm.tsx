import React, { useState, useRef, useEffect } from 'react';
import { Release, RoyaltySplit, StreamingService, Artist, ReleaseArtist } from '../types.ts';
import { 
    UploadIcon, 
    SparklesIcon, 
    InformationCircleIcon, 
    PlusIcon, 
    TrashIcon, 
    MusicNoteIcon, 
    SaveIcon, 
    CheckCircleIcon,
    ExclamationIcon,
    ClockIcon,
    UserIcon,
    PencilIcon
} from './icons/Icons.tsx';
import { generatePromotionalText, generateArtwork } from '../services/geminiService.ts';

interface ReleaseFormProps {
    onSubmit: (release: Omit<Release, 'id' | 'userId' | 'status'>) => void;
    existingArtists?: Artist[];
    releaseToEdit?: Release | null;
}

const SERVICES: StreamingService[] = [
    { id: 'spotify', name: 'Spotify' },
    { id: 'apple-music', name: 'Apple Music' },
    { id: 'youtube-music', name: 'YouTube Music' },
    { id: 'amazon-music', name: 'Amazon Music' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'instagram', name: 'Instagram' },
];

export const ReleaseForm: React.FC<ReleaseFormProps> = ({ onSubmit, existingArtists = [], releaseToEdit }) => {
    const [songTitle, setSongTitle] = useState('');
    const [genre, setGenre] = useState('Pop');
    const [releaseDate, setReleaseDate] = useState('');
    const [releaseArtists, setReleaseArtists] = useState<ReleaseArtist[]>([
        { id: '1', name: '', role: 'Main Artist', bio: '' }
    ]);
    const [artworkPreview, setArtworkPreview] = useState<string>('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>(SERVICES.map(s => s.id));
    const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplit[]>([
        { collaboratorName: 'Ben', role: 'Sanatçı', share: 100 }
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!songTitle || !releaseDate || !artworkPreview) {
            alert("Lütfen zorunlu alanları doldurun.");
            return;
        }

        const data: any = {
            songTitle,
            artistName: releaseArtists[0].name,
            genre,
            releaseDate,
            artworkPreview,
            selectedServices,
            royaltySplits,
            copyrightYear: new Date().getFullYear().toString(),
            copyrightHolder: releaseArtists[0].name,
            publishingYear: new Date().getFullYear().toString(),
            publishingHolder: 'SCF Music Distribution',
            contactEmail: 'support@scfmusic.com',
            supportPhone: '',
            producerCredits: '',
            composer: '',
            lyricist: '',
            artists: releaseArtists
        };

        onSubmit(data);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-slate-900/40 rounded-3xl border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-8">Yeni Yayın Başlat</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Şarkı Adı</label>
                        <input type="text" value={songTitle} onChange={e => setSongTitle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Sanatçı Seçimi</label>
                        <select value={releaseArtists[0].name} onChange={e => setReleaseArtists([{...releaseArtists[0], name: e.target.value}])} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" required>
                            <option value="">Seçiniz...</option>
                            {existingArtists.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Tür</label>
                        <input type="text" value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Yayın Tarihi</label>
                        <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Kapak Görseli URL</label>
                    <input type="text" value={artworkPreview} onChange={e => setArtworkPreview(e.target.value)} placeholder="https://..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" required />
                </div>

                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                    Yayını Onaya Gönder
                </button>
            </form>
        </div>
    );
};