import React, { useState, useRef, useEffect } from 'react';
import { Release, RoyaltySplit, StreamingService, Artist, ReleaseArtist } from '../types';
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
} from './icons/Icons';
import { generatePromotionalText, generateArtwork } from '../services/geminiService';

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
    { id: 'pandora', name: 'Pandora' },
    { id: 'tidal', name: 'Tidal' },
    { id: 'deezer', name: 'Deezer' },
    { id: 'iheartradio', name: 'iHeartRadio' },
    { id: 'napster', name: 'Napster' },
    { id: 'tencent', name: 'Tencent' },
    { id: 'meta', name: 'Meta' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'soundcloud', name: 'SoundCloud' },
    { id: 'shazam', name: 'Shazam' },
    { id: 'beatport', name: 'Beatport' },
    { id: 'juno-download', name: 'Juno Download' },
];

const GENRES = [
    "Pop", "Rock", "Hip Hop", "Rap", "R&B", "Country", "Electronic", "Dance",
    "House", "Techno", "Jazz", "Blues", "Classical", "Folk", "Indie",
    "Alternative", "Metal", "Punk", "Reggae", "Latin", "K-Pop", "J-Pop",
    "Soul", "Funk", "Disco", "Gospel", "Ambient", "Lo-Fi", "Trap", "Dubstep",
    "World", "Cinematic", "Afrobeats", "Reggaeton", "Singer-Songwriter"
];

const ROLES = ["Main Artist", "Featured Artist", "Composer", "Lyricist", "Producer", "Remixer"];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

export const ReleaseForm: React.FC<ReleaseFormProps> = ({ onSubmit, existingArtists = [], releaseToEdit }) => {
    const [songTitle, setSongTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [pitchforkScore, setPitchforkScore] = useState('');
    
    // Detailed Artists State
    const [releaseArtists, setReleaseArtists] = useState<ReleaseArtist[]>([
        { id: '1', name: '', role: 'Main Artist', bio: '' }
    ]);
    
    // Genre Autocomplete State
    const [showGenreSuggestions, setShowGenreSuggestions] = useState(false);
    
    // Contact Info
    const [contactEmail, setContactEmail] = useState('');
    const [supportPhone, setSupportPhone] = useState('');

    // Copyright & Credits
    const [copyrightYear, setCopyrightYear] = useState(new Date().getFullYear().toString());
    const [copyrightHolder, setCopyrightHolder] = useState('');
    
    const [publishingYear, setPublishingYear] = useState(new Date().getFullYear().toString());
    const [publishingHolder, setPublishingHolder] = useState('');

    // Files
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioDuration, setAudioDuration] = useState<string>('');
    const [artworkPreview, setArtworkPreview] = useState<string>('');
    const [artworkFile, setArtworkFile] = useState<File | null>(null);
    
    // Upload State
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [audioError, setAudioError] = useState('');

    // Distribution
    const [selectedServices, setSelectedServices] = useState<string[]>(SERVICES.map(s => s.id)); // Default all

    // Splits
    const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplit[]>([
        { collaboratorName: 'Me', role: 'Primary Artist', share: 100 }
    ]);

    // AI
    const [generatedPromo, setGeneratedPromo] = useState('');
    const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);
    const [isGeneratingArt, setIsGeneratingArt] = useState(false);
    const [artError, setArtError] = useState('');

    // Validation Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const artworkInputRef = useRef<HTMLInputElement>(null);

    // Populate data if editing
    useEffect(() => {
        if (releaseToEdit) {
            setSongTitle(releaseToEdit.songTitle);
            setGenre(releaseToEdit.genre);
            setReleaseDate(releaseToEdit.releaseDate);
            setPitchforkScore(releaseToEdit.pitchforkScore || '');
            if (releaseToEdit.artists && releaseToEdit.artists.length > 0) {
                setReleaseArtists(releaseToEdit.artists);
            } else {
                 // Fallback for old records without artists array
                 setReleaseArtists([{ id: '1', name: releaseToEdit.artistName, role: 'Main Artist', bio: '' }]);
            }
            setContactEmail(releaseToEdit.contactEmail);
            setSupportPhone(releaseToEdit.supportPhone);
            setCopyrightYear(releaseToEdit.copyrightYear);
            setCopyrightHolder(releaseToEdit.copyrightHolder);
            setPublishingYear(releaseToEdit.publishingYear);
            setPublishingHolder(releaseToEdit.publishingHolder);
            setSelectedServices(releaseToEdit.selectedServices);
            setRoyaltySplits(releaseToEdit.royaltySplits);
            setArtworkPreview(releaseToEdit.artworkPreview);
            
            // Audio file handling is tricky since we can't restore File object from localStorage
            // We rely on 'releaseToEdit' existence to know there might be a file already
            if (releaseToEdit.audioFile) {
                setAudioFile(releaseToEdit.audioFile);
            }
            // If no file object but we are editing, we assume there is one saved on backend
        } else {
             // Load draft only if NOT editing
            const savedDraft = localStorage.getItem('scf_release_draft');
            if (savedDraft) {
                const shouldRestore = window.confirm("We found a saved draft of your release. Would you like to restore it?");
                if (shouldRestore) {
                    try {
                        const data = JSON.parse(savedDraft);
                        if (data.songTitle) setSongTitle(data.songTitle);
                        if (data.artists) {
                            setReleaseArtists(data.artists);
                        } else if (data.artistName) {
                            setReleaseArtists([{ id: '1', name: data.artistName, role: 'Main Artist', bio: '' }]);
                        }
                        if (data.genre) setGenre(data.genre);
                        if (data.releaseDate) setReleaseDate(data.releaseDate);
                        if (data.pitchforkScore) setPitchforkScore(data.pitchforkScore);
                        if (data.contactEmail) setContactEmail(data.contactEmail);
                        if (data.supportPhone) setSupportPhone(data.supportPhone);
                        if (data.copyrightYear) setCopyrightYear(data.copyrightYear);
                        if (data.copyrightHolder) setCopyrightHolder(data.copyrightHolder);
                        if (data.publishingYear) setPublishingYear(data.publishingYear);
                        if (data.publishingHolder) setPublishingHolder(data.publishingHolder);
                        if (data.selectedServices) setSelectedServices(data.selectedServices);
                        if (data.royaltySplits) setRoyaltySplits(data.royaltySplits);
                        if (data.generatedPromo) setGeneratedPromo(data.generatedPromo);
                        if (data.artworkPreview) setArtworkPreview(data.artworkPreview);
                    } catch (e) {
                        console.error("Error restoring draft", e);
                    }
                }
            }
        }
    }, [releaseToEdit]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!songTitle.trim()) {
            newErrors.songTitle = 'Song title is required.';
            isValid = false;
        }

        const mainArtist = releaseArtists.find(a => a.role === 'Main Artist');
        if (!mainArtist || !mainArtist.name) {
            newErrors.artists = 'At least one Main Artist is required.';
            isValid = false;
        }

        if (!genre) {
            newErrors.genre = 'Genre is required.';
            isValid = false;
        }

        if (!releaseDate) {
            newErrors.releaseDate = 'Release date is required.';
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!contactEmail || !emailRegex.test(contactEmail)) {
            newErrors.contactEmail = 'Please enter a valid email address.';
            isValid = false;
        }

        // Phone validation (Optional but strict if provided)
        if (supportPhone) {
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            // Allow basic international formats too, checking for minimum length and valid chars
            const loosePhoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
            if (!loosePhoneRegex.test(supportPhone)) {
                 newErrors.supportPhone = 'Please enter a valid phone number (min 7 digits).';
                 isValid = false;
            }
        }

        // Pitchfork Score validation
        if (pitchforkScore) {
            const score = parseFloat(pitchforkScore);
            if (isNaN(score) || score < 0 || score > 10) {
                newErrors.pitchforkScore = 'Score must be a number between 0.0 and 10.0';
                isValid = false;
            }
        }

        // Year validation
        const yearRegex = /^\d{4}$/;
        if (!copyrightYear || !yearRegex.test(copyrightYear)) {
            newErrors.copyrightYear = 'Enter a valid 4-digit year (e.g. 2024).';
            isValid = false;
        }
        if (!publishingYear || !yearRegex.test(publishingYear)) {
            newErrors.publishingYear = 'Enter a valid 4-digit year (e.g. 2024).';
            isValid = false;
        }

        if (!copyrightHolder.trim()) {
            newErrors.copyrightHolder = 'Copyright holder is required.';
            isValid = false;
        }
        if (!publishingHolder.trim()) {
             newErrors.publishingHolder = 'Publishing holder is required.';
             isValid = false;
        }

        // File validation
        const isAudioValid = audioFile || releaseToEdit?.audioFile;
        if (!isAudioValid) {
            newErrors.audioFile = 'Audio file is required.';
            isValid = false;
        }

        if (!artworkPreview) {
            newErrors.artwork = 'Artwork is required.';
            isValid = false;
        }

        // Splits validation
        const totalShare = royaltySplits.reduce((sum, split) => sum + Number(split.share), 0);
        if (totalShare !== 100) {
            newErrors.splits = `Total splits must equal 100%. Current: ${totalShare}%`;
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleServiceToggle = (id: string) => {
        setSelectedServices(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAudioError('');
        setAudioDuration('');
        
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > MAX_FILE_SIZE) {
                setAudioError(`File size exceeds limit (${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB).`);
                return;
            }

            if (!file.type.startsWith('audio/')) {
                setAudioError('Unsupported file format. Please upload an audio file (WAV/FLAC preferred).');
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const audio = new Audio(objectUrl);
            
            audio.onloadedmetadata = () => {
                setAudioDuration(formatTime(audio.duration));
                URL.revokeObjectURL(objectUrl);
                
                setIsUploadingAudio(true);
                setUploadProgress(0);
                
                const interval = setInterval(() => {
                    setUploadProgress((prev) => {
                        const increment = Math.floor(Math.random() * 10) + 5;
                        const next = prev + increment;
                        if (next >= 100) {
                            clearInterval(interval);
                            setAudioFile(file);
                            setIsUploadingAudio(false);
                            return 100;
                        }
                        return next;
                    });
                }, 200);
            };

            audio.onerror = () => {
                setAudioError('Could not read audio file metadata.');
                URL.revokeObjectURL(objectUrl);
            };
        }
    };

    const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setArtworkFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setArtworkPreview(reader.result as string);
                setArtError('');
            };
            reader.readAsDataURL(file);
        }
    };

    // Artist Management
    const handleAddArtist = () => {
        setReleaseArtists([...releaseArtists, { id: Date.now().toString(), name: '', role: 'Featured Artist', bio: '' }]);
    };

    const handleRemoveArtist = (id: string) => {
        if (releaseArtists.length > 1) {
            setReleaseArtists(releaseArtists.filter(a => a.id !== id));
        }
    };

    const handleArtistChange = (id: string, field: keyof ReleaseArtist, value: string) => {
        setReleaseArtists(releaseArtists.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    // Splits
    const handleAddSplit = () => {
        setRoyaltySplits([...royaltySplits, { collaboratorName: '', role: '', share: 0 }]);
    };

    const handleRemoveSplit = (index: number) => {
        setRoyaltySplits(royaltySplits.filter((_, i) => i !== index));
    };

    const handleSplitChange = (index: number, field: keyof RoyaltySplit, value: string | number) => {
        const newSplits = [...royaltySplits];
        newSplits[index] = { ...newSplits[index], [field]: value };
        setRoyaltySplits(newSplits);
    };

    const handleGeneratePromo = async () => {
        const mainArtist = releaseArtists.find(a => a.role === 'Main Artist')?.name || releaseArtists[0]?.name;
        if (!songTitle || !mainArtist || !genre) {
            alert('Please fill in Song Title, Main Artist, and Genre first.');
            return;
        }
        setIsGeneratingPromo(true);
        const text = await generatePromotionalText(songTitle, mainArtist, genre);
        setGeneratedPromo(text);
        setIsGeneratingPromo(false);
    };

    const handleGenerateArtwork = async () => {
        setArtError('');
        const mainArtist = releaseArtists.find(a => a.role === 'Main Artist')?.name || releaseArtists[0]?.name;
        if (!songTitle || !mainArtist || !genre) {
            setArtError('Please fill in Song Title, Main Artist, and Genre first.');
            return;
        }
        setIsGeneratingArt(true);
        setArtworkPreview(''); 
        
        const imageBase64 = await generateArtwork(songTitle, mainArtist, genre);
        if (imageBase64) {
            setArtworkPreview(imageBase64);
            fetch(imageBase64)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "generated_artwork.png", { type: "image/png" });
                    setArtworkFile(file);
                });
        } else {
            setArtError('Failed to generate artwork. Please try again.');
        }
        setIsGeneratingArt(false);
    };

    const handleSaveDraft = () => {
        const draft = {
            songTitle,
            artists: releaseArtists,
            genre,
            releaseDate,
            pitchforkScore,
            contactEmail,
            supportPhone,
            copyrightYear,
            copyrightHolder,
            publishingYear,
            publishingHolder,
            selectedServices,
            royaltySplits,
            generatedPromo,
            artworkPreview
        };
        
        try {
            localStorage.setItem('scf_release_draft', JSON.stringify(draft));
            alert("Draft saved successfully!");
        } catch (e) {
            try {
                const { artworkPreview, ...textDraft } = draft;
                localStorage.setItem('scf_release_draft', JSON.stringify(textDraft));
                alert("Draft saved! (Artwork was not saved due to size limits)");
            } catch (err) {
                alert("Failed to save draft.");
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            // Scroll to top of form to see errors
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const mainArtist = releaseArtists.find(a => a.role === 'Main Artist');
        // Derive fields for backward compatibility
        const composerCredits = releaseArtists.filter(a => a.role === 'Composer').map(a => a.name).join(', ');
        const lyricistCredits = releaseArtists.filter(a => a.role === 'Lyricist').map(a => a.name).join(', ');
        const producerCredits = releaseArtists.filter(a => a.role === 'Producer').map(a => a.name).join(', ');
        const artistNameDisplay = releaseArtists
            .filter(a => a.role === 'Main Artist' || a.role === 'Featured Artist')
            .map(a => a.role === 'Featured Artist' ? `feat. ${a.name}` : a.name)
            .join(' ');

        const releaseData: Omit<Release, 'id' | 'userId' | 'status'> = {
            songTitle,
            artistName: artistNameDisplay,
            genre,
            releaseDate,
            pitchforkScore,
            contactEmail,
            supportPhone,
            copyrightYear,
            copyrightHolder,
            publishingYear,
            publishingHolder,
            producerCredits,
            composer: composerCredits,
            lyricist: lyricistCredits,
            audioFile: audioFile || undefined, // Pass undefined if null, App.tsx will handle preservation of old file if editing
            artworkPreview,
            selectedServices,
            royaltySplits,
            artists: releaseArtists // Save detailed list
        };

        onSubmit(releaseData);
        if (!releaseToEdit) {
            localStorage.removeItem('scf_release_draft');
        }
    };
    
    // Autocomplete helpers
    const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGenre(e.target.value);
        setShowGenreSuggestions(true);
    };

    const handleGenreSelect = (selectedGenre: string) => {
        setGenre(selectedGenre);
        setShowGenreSuggestions(false);
    };

    const filteredGenres = GENRES.filter(g => 
        g.toLowerCase().includes(genre.toLowerCase()) && 
        g.toLowerCase() !== genre.toLowerCase()
    );

    const inputClasses = (hasError: boolean) => 
        `w-full bg-slate-900/50 border ${hasError ? 'border-red-500/60 focus:ring-red-500' : 'border-slate-700/50 focus:ring-purple-500'} rounded-lg px-4 py-3 focus:ring-2 focus:border-transparent focus:outline-none transition-all text-white placeholder-slate-500 shadow-inner focus:shadow-[0_0_10px_rgba(168,85,247,0.3)]`;
    
    const labelClasses = "block text-sm font-medium text-slate-300 mb-1.5";
    const errorClasses = "text-xs text-red-400 mt-1.5 flex items-center";

    return (
        <div className="max-w-4xl mx-auto relative animate-fadeIn">
             {/* Glow blob behind form */}
             <div className="absolute top-20 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -z-10"></div>
             <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>

            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    {releaseToEdit ? 'Edit Release' : 'Create New Release'}
                </h2>
                <p className="text-slate-400 mt-2">
                    {releaseToEdit ? 'Update your track details below.' : 'Enter your track details to get started.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/5 pb-2 flex items-center">
                        <span className="w-1 h-6 bg-cyan-500 rounded-full mr-3 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                        Track Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Song Title *</label>
                            <input 
                                type="text" 
                                value={songTitle} 
                                onChange={e => setSongTitle(e.target.value)} 
                                className={inputClasses(!!errors.songTitle)} 
                                
                            />
                            {errors.songTitle && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.songTitle}</p>}
                        </div>
                        
                        {/* ARTISTS SECTION */}
                        <div className="md:col-span-2 space-y-3">
                             <div className="flex justify-between items-center">
                                <label className={labelClasses}>Artists & Credits *</label>
                                <button type="button" onClick={handleAddArtist} className="text-xs text-cyan-400 flex items-center hover:text-cyan-300">
                                    <PlusIcon className="h-3 w-3 mr-1" /> Add Artist/Credit
                                </button>
                             </div>
                             {existingArtists.length === 0 && (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm flex items-center mb-2">
                                    <ExclamationIcon className="h-4 w-4 mr-2" />
                                    You haven't added any artist profiles yet. Please go to the 'Artists' tab to add artists before creating a release.
                                </div>
                             )}
                             {releaseArtists.map((artist, idx) => (
                                <div key={artist.id} className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/50 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                    <div className="md:col-span-3">
                                        <select 
                                            value={artist.role} 
                                            onChange={(e) => handleArtistChange(artist.id, 'role', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                        >
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-4">
                                        <select
                                            value={artist.name}
                                            onChange={(e) => handleArtistChange(artist.id, 'name', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                            required
                                        >
                                            <option value="" disabled>Select Artist</option>
                                            {existingArtists.map((a) => (
                                                <option key={a.id} value={a.name}>
                                                    {a.name}
                                                </option>
                                            ))}
                                            {/* Handle case where editing a release has an artist NOT in the current user list anymore (rare edge case) */}
                                            {releaseToEdit && !existingArtists.find(ea => ea.name === artist.name) && artist.name && (
                                                 <option value={artist.name}>{artist.name}</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className="md:col-span-4">
                                        <textarea
                                            placeholder="Short Bio (Optional)"
                                            value={artist.bio || ''}
                                            onChange={(e) => handleArtistChange(artist.id, 'bio', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-purple-500 outline-none resize-none h-[42px]"
                                            rows={1}
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-center mt-1">
                                        {releaseArtists.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveArtist(artist.id)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                             ))}
                             {errors.artists && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.artists}</p>}
                        </div>

                        <div className="relative">
                            <label className={labelClasses}>Genre *</label>
                            <input 
                                type="text" 
                                value={genre} 
                                onChange={handleGenreChange}
                                onFocus={() => setShowGenreSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowGenreSuggestions(false), 200)}
                                className={inputClasses(!!errors.genre)} 
                                placeholder="e.g. Pop"
                            />
                            {showGenreSuggestions && genre && filteredGenres.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {filteredGenres.map((g) => (
                                        <div 
                                            key={g}
                                            onClick={() => handleGenreSelect(g)}
                                            className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-slate-200 text-sm transition-colors"
                                        >
                                            {g}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.genre && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.genre}</p>}
                        </div>
                        <div>
                            <label className={labelClasses}>Release Date *</label>
                            <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} className={inputClasses(!!errors.releaseDate)} />
                            {errors.releaseDate && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.releaseDate}</p>}
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Pitchfork Score (0.0 - 10.0)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                max="10" 
                                value={pitchforkScore} 
                                onChange={e => setPitchforkScore(e.target.value)} 
                                className={inputClasses(!!errors.pitchforkScore)} 
                                placeholder="e.g. 8.5"
                            />
                            {errors.pitchforkScore && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.pitchforkScore}</p>}
                        </div>
                    </div>
                </div>

                {/* Section 2: Contact Information */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/5 pb-2 flex items-center">
                        <span className="w-1 h-6 bg-purple-500 rounded-full mr-3 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                        Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Contact Email *</label>
                            <input 
                                type="email" 
                                value={contactEmail} 
                                onChange={e => setContactEmail(e.target.value)} 
                                className={inputClasses(!!errors.contactEmail)} 
                                placeholder="For inquiries" 
                            />
                            {errors.contactEmail && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.contactEmail}</p>}
                        </div>
                        <div>
                            <label className={labelClasses}>Support Phone Number</label>
                            <input 
                                type="tel" 
                                value={supportPhone} 
                                onChange={e => setSupportPhone(e.target.value)} 
                                className={inputClasses(!!errors.supportPhone)} 
                                placeholder="Optional (e.g. +1-555-0123)" 
                            />
                            {errors.supportPhone && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.supportPhone}</p>}
                        </div>
                    </div>
                </div>

                {/* AI Promo Generator */}
                <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-6 rounded-2xl border border-indigo-500/30 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                    <div className="relative flex items-center justify-between mb-4">
                         <div className="flex items-center space-x-2">
                            <SparklesIcon className="h-5 w-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" />
                            <h4 className="font-semibold text-indigo-200">AI Promotion Assistant</h4>
                         </div>
                         <button 
                            type="button" 
                            onClick={handleGeneratePromo}
                            disabled={isGeneratingPromo}
                            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center"
                         >
                            {isGeneratingPromo ? 'Generating...' : 'Generate Blurb'}
                         </button>
                    </div>
                    {generatedPromo && (
                        <div className="bg-slate-950/50 p-4 rounded-xl text-sm text-cyan-100 italic border border-indigo-500/20 shadow-inner">
                            "{generatedPromo}"
                        </div>
                    )}
                    {!generatedPromo && <p className="text-xs text-indigo-300/70">Fill in Song Title, Main Artist, and Genre to generate a promotional blurb.</p>}
                </div>

                {/* Section 3: Uploads */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/5 pb-2 flex items-center">
                        <span className="w-1 h-6 bg-pink-500 rounded-full mr-3 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></span>
                        Assets
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Artwork */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className={labelClasses}>Artwork (3000x3000px) *</label>
                                <button 
                                    type="button"
                                    onClick={handleGenerateArtwork}
                                    disabled={isGeneratingArt}
                                    className="text-xs flex items-center text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                                >
                                    <SparklesIcon className="h-3 w-3 mr-1" />
                                    {isGeneratingArt ? 'Generating...' : 'Generate AI Art'}
                                </button>
                            </div>
                            
                            <div 
                                onClick={() => !isGeneratingArt && artworkInputRef.current?.click()}
                                className={`border-2 border-dashed ${artError || errors.artwork ? 'border-red-500/50 hover:border-red-500' : 'border-slate-600 hover:border-purple-500'} rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition-all group overflow-hidden relative shadow-inner`}
                            >
                                {isGeneratingArt ? (
                                    <div className="flex flex-col items-center justify-center animate-pulse">
                                        <SparklesIcon className="h-10 w-10 text-purple-400 mb-3 animate-pulse" />
                                        <span className="text-purple-300 text-sm font-medium">Creating your masterpiece...</span>
                                    </div>
                                ) : artworkPreview ? (
                                    <img src={artworkPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="bg-slate-800/50 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                            <UploadIcon className="h-8 w-8 text-slate-400 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                        <span className="text-slate-400 text-sm group-hover:text-slate-200">Click to upload image</span>
                                    </>
                                )}
                                <input ref={artworkInputRef} type="file" accept="image/*" className="hidden" onChange={handleArtworkChange} />
                            </div>
                            {artError && (
                                <p className="text-xs text-red-400 mt-2 flex items-center">
                                    <ExclamationIcon className="h-4 w-4 mr-1" />
                                    {artError}
                                </p>
                            )}
                            {errors.artwork && (
                                <p className={errorClasses}>
                                    <ExclamationIcon className="h-4 w-4 mr-1" />
                                    {errors.artwork}
                                </p>
                            )}
                        </div>

                         {/* Audio */}
                         <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className={labelClasses}>Audio File (WAV/FLAC) {releaseToEdit ? '(Optional)' : '*'}</label>
                                {releaseToEdit && !audioFile && (
                                    <span className="text-xs text-green-400 flex items-center">
                                        <CheckCircleIcon className="h-3 w-3 mr-1" /> Using existing file
                                    </span>
                                )}
                            </div>
                            
                            {isUploadingAudio ? (
                                <div className="border-2 border-dashed border-slate-600 rounded-2xl h-64 flex flex-col items-center justify-center bg-slate-800/20 p-6">
                                    <div className="w-full max-w-xs">
                                        <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
                                            <span className="animate-pulse">Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden shadow-inner">
                                            <div 
                                                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ) : audioFile ? (
                                <div className="w-full bg-slate-800/50 border border-cyan-500/50 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group h-64">
                                     {/* Background pulse effect */}
                                     <div className="absolute inset-0 bg-cyan-500/5 animate-pulse-slow"></div>
                                     
                                     <div className="relative z-10 flex flex-col items-center">
                                         <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-4 rounded-full shadow-lg shadow-cyan-500/30 mb-4 group-hover:scale-110 transition-transform">
                                             <MusicNoteIcon className="h-8 w-8 text-white" />
                                         </div>
                                         
                                         <h4 className="text-lg font-bold text-white mb-1 max-w-xs truncate text-center">{audioFile.name}</h4>
                                         
                                         <div className="flex items-center space-x-3 text-sm text-cyan-300 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/20 mt-2">
                                             <span className="font-mono">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                             <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
                                             <span className="flex items-center font-mono">
                                                 <ClockIcon className="h-3 w-3 mr-1.5" />
                                                 {audioDuration || '--:--'}
                                             </span>
                                         </div>

                                         <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-6 text-xs font-semibold text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded-lg px-4 py-2 transition-all"
                                         >
                                            Replace Audio File
                                         </button>
                                     </div>
                                     
                                     {/* Success Check */}
                                     <div className="absolute top-4 right-4 text-green-400 bg-green-400/10 p-1 rounded-full">
                                        <CheckCircleIcon className="h-6 w-6" />
                                     </div>
                                     
                                     <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioChange} />
                                </div>
                            ) : (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed ${audioError || errors.audioFile ? 'border-red-500/50 hover:border-red-500' : 'border-slate-600 hover:border-cyan-500'} rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition-all group shadow-inner`}
                                >
                                    <div className="bg-slate-800/50 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                        <UploadIcon className="h-8 w-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <span className="text-slate-400 text-sm group-hover:text-slate-200">
                                        {releaseToEdit ? 'Click to replace audio' : 'Click to upload audio'}
                                    </span>
                                    <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioChange} />
                                </div>
                            )}
                             {audioError && (
                                <p className="text-xs text-red-400 mt-2 flex items-center">
                                    <ExclamationIcon className="h-4 w-4 mr-1" />
                                    {audioError}
                                </p>
                            )}
                             {errors.audioFile && (
                                <p className={errorClasses}>
                                    <ExclamationIcon className="h-4 w-4 mr-1" />
                                    {errors.audioFile}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Metadata Preview */}
                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 mt-4 shadow-lg backdrop-blur-sm">
                        <h4 className="text-base font-semibold text-slate-200 mb-4 flex items-center">
                            <span className="bg-blue-500/20 text-blue-300 p-1.5 rounded-md mr-3 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                                <MusicNoteIcon className="h-4 w-4" />
                            </span>
                            Metadata Preview
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Song Title</p>
                                <p className="text-sm font-medium text-white truncate">{songTitle || <span className="text-slate-600 italic">Not set</span>}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Main Artist</p>
                                <p className="text-sm font-medium text-white truncate">
                                    {releaseArtists.find(a => a.role === 'Main Artist')?.name || <span className="text-slate-600 italic">Not set</span>}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Genre</p>
                                <p className="text-sm font-medium text-white truncate">{genre || <span className="text-slate-600 italic">Not set</span>}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Release Date</p>
                                <p className="text-sm font-medium text-white truncate">{releaseDate || <span className="text-slate-600 italic">Not set</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Copyright & Credits */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/5 pb-2 flex items-center">
                        <span className="w-1 h-6 bg-blue-500 rounded-full mr-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                        Copyright & Publishing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* C Line */}
                         <div>
                            <input 
                                type="text" 
                                placeholder="Copyright Year (e.g., 2024)" 
                                value={copyrightYear} 
                                onChange={e => setCopyrightYear(e.target.value)} 
                                className={inputClasses(!!errors.copyrightYear)} 
                            />
                            {errors.copyrightYear && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.copyrightYear}</p>}
                         </div>
                         <div>
                            <input 
                                type="text" 
                                placeholder="Copyright Holder (e.g., Artist Name)" 
                                value={copyrightHolder} 
                                onChange={e => setCopyrightHolder(e.target.value)} 
                                className={inputClasses(!!errors.copyrightHolder)} 
                            />
                             {errors.copyrightHolder && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.copyrightHolder}</p>}
                         </div>
                        
                        <div className="md:col-span-2 mb-4">
                            <div className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-400 text-sm flex items-center select-none">
                                <InformationCircleIcon className="h-4 w-4 mr-2 text-slate-500" />
                                <span className="font-semibold mr-1">Copyright Line:</span> 
                                <span className="italic">© {copyrightYear || '[Year]'} {copyrightHolder || '[Holder]'}</span>
                            </div>
                        </div>

                        {/* P Line */}
                         <div>
                             <input 
                                type="text" 
                                placeholder="Publishing Year (e.g., 2024)" 
                                value={publishingYear} 
                                onChange={e => setPublishingYear(e.target.value)} 
                                className={inputClasses(!!errors.publishingYear)} 
                            />
                            {errors.publishingYear && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.publishingYear}</p>}
                         </div>
                         <div>
                            <input 
                                type="text" 
                                placeholder="Publishing Holder (e.g., Record Label)" 
                                value={publishingHolder} 
                                onChange={e => setPublishingHolder(e.target.value)} 
                                className={inputClasses(!!errors.publishingHolder)} 
                            />
                             {errors.publishingHolder && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.publishingHolder}</p>}
                         </div>

                        <div className="md:col-span-2">
                            <div className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-400 text-sm flex items-center select-none">
                                <InformationCircleIcon className="h-4 w-4 mr-2 text-slate-500" />
                                <span className="font-semibold mr-1">Publishing Line:</span> 
                                <span className="italic">℗ {publishingYear || '[Year]'} {publishingHolder || '[Holder]'}</span>
                            </div>
                        </div>
                        
                        {/* Legacy credits are now handled in Artists & Credits above, but we display this hint */}
                        <div className="md:col-span-2 text-xs text-slate-500 italic mt-2">
                             Note: Please ensure all Composers, Lyricists, and Producers are listed in the 'Artists & Credits' section above.
                        </div>
                    </div>
                </div>

                {/* Section 5: Distribution */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/5 pb-2 flex items-center">
                        <span className="w-1 h-6 bg-green-500 rounded-full mr-3 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        Distribution Channels
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {SERVICES.map(service => (
                            <div 
                                key={service.id}
                                onClick={() => handleServiceToggle(service.id)}
                                className={`cursor-pointer rounded-xl p-4 border flex flex-col items-center justify-center space-y-2 transition-all duration-300 ${selectedServices.includes(service.id) ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800/20 border-slate-700 hover:bg-slate-800/40 hover:border-slate-600'}`}
                            >
                                <span className={`text-sm font-medium ${selectedServices.includes(service.id) ? 'text-blue-200' : 'text-slate-400'}`}>{service.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 6: Splits */}
                <div className="space-y-6">
                     <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                            <span className="w-1 h-6 bg-yellow-500 rounded-full mr-3 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                            Royalty Splits
                        </h3>
                        <button type="button" onClick={handleAddSplit} className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center font-medium transition-colors">
                            <PlusIcon className="h-4 w-4 mr-1" /> Add Collaborator
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {royaltySplits.map((split, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                                <input 
                                    type="text" 
                                    placeholder="Collaborator Name" 
                                    value={split.collaboratorName} 
                                    onChange={e => handleSplitChange(index, 'collaboratorName', e.target.value)}
                                    className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Role (e.g., Producer)" 
                                    value={split.role} 
                                    onChange={e => handleSplitChange(index, 'role', e.target.value)}
                                    className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none"
                                />
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="%" 
                                        value={split.share} 
                                        onChange={e => handleSplitChange(index, 'share', Number(e.target.value))}
                                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none"
                                    />
                                    <span className="text-slate-400">%</span>
                                </div>
                                {index > 0 && (
                                    <button type="button" onClick={() => handleRemoveSplit(index)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                         <div className="flex justify-end items-center gap-4">
                             {errors.splits && <p className={errorClasses}><ExclamationIcon className="h-3 w-3 mr-1" />{errors.splits}</p>}
                             <div className="text-right text-sm text-slate-400">
                                Total Split: <span className={royaltySplits.reduce((s, split) => s + Number(split.share), 0) === 100 ? "text-green-400 font-bold drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "text-red-400 font-bold"}>{royaltySplits.reduce((s, split) => s + Number(split.share), 0)}%</span>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4">
                    {!releaseToEdit && (
                        <button 
                            type="button" 
                            onClick={handleSaveDraft}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg border border-slate-600 transition-all flex items-center justify-center"
                        >
                            <SaveIcon className="h-5 w-5 mr-2" />
                            Save Draft
                        </button>
                    )}
                    <button 
                        type="submit" 
                        className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all transform hover:-translate-y-1"
                    >
                        {releaseToEdit ? 'Update Release' : 'Submit Release'}
                    </button>
                </div>
            </form>
        </div>
    );
};