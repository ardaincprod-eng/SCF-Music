import React, { useState, useEffect } from 'react';
import { Release, DistributionStatus } from '../types';
import { CheckCircleIcon, ClockIcon, ExclamationIcon, RefreshIcon, ArrowLeftIcon } from './icons/Icons';

interface DashboardProps {
  release: Release;
  onBackToReleases: () => void;
}

const serviceNames: { [key: string]: string } = {
    'spotify': 'Spotify',
    'apple-music': 'Apple Music',
    'youtube-music': 'YouTube Music',
    'amazon-music': 'Amazon Music',
    'pandora': 'Pandora',
    'tidal': 'Tidal',
    'deezer': 'Deezer',
    'iheartradio': 'iHeartRadio',
    'napster': 'Napster',
    'tencent': 'Tencent',
    'meta': 'Meta',
    'tiktok': 'TikTok',
    'soundcloud': 'SoundCloud',
    'shazam': 'Shazam',
    'beatport': 'Beatport',
    'juno-download': 'Juno Download',
}

const StatusIndicator: React.FC<{ status: DistributionStatus }> = ({ status }) => {
    const baseClasses = "flex items-center space-x-2 text-sm font-bold px-3 py-1.5 rounded-full border shadow-[0_0_10px_rgba(0,0,0,0.2)]";
    switch (status) {
        case DistributionStatus.LIVE:
            return <div className={`${baseClasses} bg-green-500/10 border-green-500/30 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]`}><CheckCircleIcon className="h-4 w-4" /><span>Live</span></div>;
        case DistributionStatus.IN_REVIEW:
            return <div className={`${baseClasses} bg-yellow-500/10 border-yellow-500/30 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.2)]`}><ClockIcon className="h-4 w-4" /><span>In Review</span></div>;
        case DistributionStatus.PROCESSING:
            return <div className={`${baseClasses} bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]`}><RefreshIcon className="h-4 w-4 animate-spin" /><span>Processing</span></div>;
        case DistributionStatus.ERROR:
            return <div className={`${baseClasses} bg-red-500/10 border-red-500/30 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]`}><ExclamationIcon className="h-4 w-4" /><span>Error</span></div>;
        default:
            return <div className={`${baseClasses} bg-slate-800/50 border-slate-700 text-slate-400`}><ClockIcon className="h-4 w-4" /><span>Pending</span></div>;
    }
}

export const Dashboard: React.FC<DashboardProps> = ({ release, onBackToReleases }) => {
  const [statuses, setStatuses] = useState<Record<string, DistributionStatus>>(() => {
    const initialStatuses: Record<string, DistributionStatus> = {};
    release.selectedServices.forEach(serviceId => {
      initialStatuses[serviceId] = DistributionStatus.PENDING;
    });
    return initialStatuses;
  });

  useEffect(() => {
    const updateStatus = (serviceId: string, newStatus: DistributionStatus) => {
        setStatuses(prev => ({ ...prev, [serviceId]: newStatus }));
    };

    release.selectedServices.forEach(serviceId => {
      setTimeout(() => updateStatus(serviceId, DistributionStatus.PROCESSING), 1500);
      setTimeout(() => updateStatus(serviceId, DistributionStatus.IN_REVIEW), 5000 + Math.random() * 2000);
      setTimeout(() => updateStatus(serviceId, DistributionStatus.LIVE), 10000 + Math.random() * 4000);
    });
  }, [release.selectedServices]);

  return (
    <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
            <button onClick={onBackToReleases} className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mx-auto mb-4 group">
                <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to My Releases
            </button>
            <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">Distribution Dashboard</h2>
            <p className="text-slate-400 mt-2">Your release is on its way to stores. Track its progress below.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 p-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col items-center text-center">
                <div className="relative">
                    <img src={release.artworkPreview} alt="Artwork" className="w-52 h-52 object-cover rounded-xl shadow-2xl mb-4 border border-white/10" />
                    <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
                </div>
                <h3 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{release.songTitle}</h3>
                <p className="text-lg text-cyan-400 font-medium">{release.artistName}</p>
                <p className="text-sm text-slate-500 mt-1 px-3 py-1 bg-slate-800/50 rounded-full border border-white/5">{release.genre}</p>
                
                {/* Pitchfork Score Display */}
                {release.pitchforkScore && (
                    <div className="mt-6 flex flex-col items-center animate-fadeIn">
                        <span className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-semibold">Pitchfork Score</span>
                        <div className="w-16 h-16 flex items-center justify-center bg-white text-red-600 font-bold text-2xl rounded-full border-4 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                            {release.pitchforkScore}
                        </div>
                    </div>
                )}
            </div>
            <div className="md:col-span-2">
                <h4 className="text-xl font-semibold mb-4 text-white flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                    Distribution Status
                </h4>
                <div className="space-y-3">
                    {release.selectedServices.map(serviceId => (
                        <div key={serviceId} className="flex items-center justify-between bg-slate-800/30 border border-white/5 p-4 rounded-xl hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center space-x-4">
                                <span className="font-medium text-lg text-slate-200">{serviceNames[serviceId] || serviceId}</span>
                            </div>
                            <StatusIndicator status={statuses[serviceId]} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};