import React, { useState, useRef, useEffect } from 'react';
import { Release } from '../types';
import { 
    PlayIcon, 
    PauseIcon, 
    MusicNoteIcon, 
    ExclamationIcon, 
    VolumeUpIcon, 
    VolumeOffIcon, 
    SkipBackIcon, 
    SkipForwardIcon 
} from './icons/Icons';

interface TracksProps {
    releases: Release[];
}

export const Tracks: React.FC<TracksProps> = ({ releases }) => {
    const [currentTrack, setCurrentTrack] = useState<Release | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [previousVolume, setPreviousVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [audioError, setAudioError] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (currentTrack) {
            if (audioRef.current) {
                // If the release has a file object, create a URL
                if (currentTrack.audioFile) {
                    const url = URL.createObjectURL(currentTrack.audioFile);
                    audioRef.current.src = url;
                    setAudioError(false);
                    audioRef.current.play()
                        .then(() => setIsPlaying(true))
                        .catch(err => {
                            console.error("Playback error:", err);
                            setIsPlaying(false);
                        });
                    
                    // Cleanup URL on unmount or track change
                    return () => URL.revokeObjectURL(url);
                } else {
                    // Fallback for reloaded data where File object is lost
                    setAudioError(true);
                    setIsPlaying(false);
                }
            }
        }
    }, [currentTrack]);

    const togglePlay = () => {
        if (!currentTrack) return;
        if (audioError) return;

        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            audioRef.current?.play();
            setIsPlaying(true);
        }
    };

    const handleNext = () => {
        if (!currentTrack) return;
        const currentIndex = releases.findIndex(r => r.id === currentTrack.id);
        if (currentIndex < releases.length - 1) {
            setCurrentTrack(releases[currentIndex + 1]);
        } else {
            // Loop to first? Or stop. Let's stop at end for now, or loop.
            // Let's loop for smoother UX
            setCurrentTrack(releases[0]);
        }
    };

    const handlePrev = () => {
        if (!currentTrack) return;
        
        // If track has played more than 3 seconds, restart it
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        const currentIndex = releases.findIndex(r => r.id === currentTrack.id);
        if (currentIndex > 0) {
            setCurrentTrack(releases[currentIndex - 1]);
        } else {
             // Go to last
             setCurrentTrack(releases[releases.length - 1]);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = Number(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
            setIsMuted(vol === 0);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                const newVol = previousVolume === 0 ? 0.5 : previousVolume;
                setVolume(newVol);
                audioRef.current.volume = newVol;
                setIsMuted(false);
            } else {
                setPreviousVolume(volume);
                setVolume(0);
                audioRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };
    
    const handleTrackEnded = () => {
        setIsPlaying(false);
        handleNext(); // Auto-play next track
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Calculate progress percentages for slider backgrounds
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const volumePercent = volume * 100;

    return (
        <div className="max-w-5xl mx-auto pb-24 relative">
             <div className="text-center mb-12">
                <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-500">My Tracks</h2>
                <p className="text-slate-400 mt-2">Listen to and manage your uploaded master files.</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
                {releases.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <MusicNoteIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>No tracks found. Create a release to see tracks here.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-16">#</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Album</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {releases.map((release, index) => (
                                <tr 
                                    key={release.id} 
                                    className={`hover:bg-white/5 transition-colors group ${currentTrack?.id === release.id ? 'bg-indigo-500/10' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                        {currentTrack?.id === release.id && isPlaying ? (
                                             <div className="flex space-x-[2px] items-end h-4 w-4">
                                                <div className="w-[3px] bg-green-400 animate-[music-bar_0.8s_ease-in-out_infinite]"></div>
                                                <div className="w-[3px] bg-green-400 animate-[music-bar_1.1s_ease-in-out_infinite_0.1s]"></div>
                                                <div className="w-[3px] bg-green-400 animate-[music-bar_0.9s_ease-in-out_infinite_0.2s]"></div>
                                             </div>
                                        ) : (
                                            <span className="group-hover:hidden">{index + 1}</span>
                                        )}
                                        <button 
                                            onClick={() => setCurrentTrack(release)}
                                            className={`hidden group-hover:block ${currentTrack?.id === release.id && isPlaying ? 'hidden' : ''}`}
                                        >
                                            <PlayIcon className="h-5 w-5 text-white hover:text-cyan-400" />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 relative">
                                                <img className="h-10 w-10 rounded-lg object-cover shadow-sm border border-white/5" src={release.artworkPreview} alt="" />
                                                <div className="absolute inset-0 bg-black/40 rounded-lg hidden group-hover:flex items-center justify-center">
                                                    <PlayIcon className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className={`text-sm font-bold ${currentTrack?.id === release.id ? 'text-green-400' : 'text-white'}`}>{release.songTitle}</div>
                                                <div className="text-xs text-slate-400">{release.artistName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 hidden md:table-cell">
                                        {release.songTitle} <span className="text-xs text-slate-600 border border-slate-700 px-1 rounded ml-1">Single</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 hidden sm:table-cell">
                                        {new Date(release.releaseDate || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {!release.audioFile && (
                                            <span className="text-xs text-red-400 flex items-center justify-end" title="File not available in session storage">
                                                <ExclamationIcon className="h-4 w-4 mr-1" /> No Audio
                                            </span>
                                        )}
                                        {release.audioFile && (
                                             <span className="text-xs text-slate-500 font-mono">
                                                 Ready
                                             </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Persistent Bottom Player */}
            <div className={`fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 p-4 transition-transform duration-500 z-50 ${currentTrack ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="container mx-auto max-w-6xl flex items-center justify-between">
                    {/* Track Info */}
                    <div className="flex items-center w-1/4 min-w-[200px]">
                        {currentTrack && (
                            <>
                                <img src={currentTrack.artworkPreview} alt="" className="h-14 w-14 rounded-lg object-cover shadow-lg border border-white/5 mr-4" />
                                <div className="hidden sm:block overflow-hidden">
                                    <p className="text-white font-bold truncate">{currentTrack.songTitle}</p>
                                    <p className="text-slate-400 text-sm truncate">{currentTrack.artistName}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center w-1/2 max-w-lg">
                        <div className="flex items-center space-x-6 mb-2">
                            <button 
                                onClick={handlePrev}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Previous"
                            >
                                <SkipBackIcon className="h-5 w-5" />
                            </button>

                             <button 
                                onClick={togglePlay}
                                disabled={audioError}
                                className={`h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${audioError ? 'bg-slate-700 cursor-not-allowed' : 'bg-white text-black hover:bg-slate-200'}`}
                            >
                                {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6 ml-0.5" />}
                            </button>

                            <button 
                                onClick={handleNext}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Next"
                            >
                                <SkipForwardIcon className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="w-full flex items-center space-x-3 text-xs font-mono text-slate-400">
                            <span>{formatTime(currentTime)}</span>
                            <div className="relative flex-grow h-1 bg-slate-700 rounded-lg group">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={duration || 100} 
                                    value={currentTime}
                                    onChange={handleProgressChange}
                                    style={{
                                        background: `linear-gradient(to right, #22d3ee ${progressPercent}%, #334155 ${progressPercent}%)`
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-100 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                                />
                            </div>
                            <span>{formatTime(duration)}</span>
                        </div>
                        {audioError && <p className="text-xs text-red-400 mt-1">Audio file not found (Session Expired)</p>}
                    </div>

                    {/* Volume */}
                    <div className="flex items-center justify-end w-1/4 space-x-3 min-w-[150px]">
                        <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
                            {isMuted || volume === 0 ? <VolumeOffIcon className="h-5 w-5" /> : <VolumeUpIcon className="h-5 w-5" />}
                        </button>
                        <div className="w-24 h-1 bg-slate-700 rounded-lg relative">
                             <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                style={{
                                    background: `linear-gradient(to right, #a78bfa ${volumePercent}%, #334155 ${volumePercent}%)`
                                }}
                                className="absolute inset-0 w-full h-full opacity-100 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                            />
                        </div>
                    </div>
                </div>
                <audio 
                    ref={audioRef} 
                    onTimeUpdate={handleTimeUpdate} 
                    onEnded={handleTrackEnded}
                    onError={() => { setIsPlaying(false); setAudioError(true); }}
                />
            </div>
        </div>
    );
};