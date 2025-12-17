import React from 'react';
import { Release, ReleaseStatus } from '../types';
import { ClockIcon, ShieldCheckIcon, XCircleIcon, ArrowRightIcon, PencilIcon } from './icons/Icons';

interface MyReleasesProps {
  releases: Release[];
  onViewDashboard: (release: Release) => void;
  onEditRelease?: (release: Release) => void;
}

const StatusBadge: React.FC<{ status: ReleaseStatus }> = ({ status }) => {
  const baseClasses = "flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm";
  switch (status) {
    case ReleaseStatus.APPROVED:
      return <div className={`${baseClasses} bg-green-500/10 border-green-500/30 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]`}><ShieldCheckIcon className="h-4 w-4" /><span>Approved</span></div>;
    case ReleaseStatus.REJECTED:
      return <div className={`${baseClasses} bg-red-500/10 border-red-500/30 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]`}><XCircleIcon className="h-4 w-4" /><span>Rejected</span></div>;
    case ReleaseStatus.PENDING_APPROVAL:
    default:
      return <div className={`${baseClasses} bg-yellow-500/10 border-yellow-500/30 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.2)]`}><ClockIcon className="h-4 w-4" /><span>Pending Approval</span></div>;
  }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    // Handles both ISO strings and YYYY-MM-DD format
    const date = new Date(dateString);
    // Add timeZone: 'UTC' to correctly handle YYYY-MM-DD which can be interpreted as previous day in some timezones
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
};

export const MyReleases: React.FC<MyReleasesProps> = ({ releases, onViewDashboard, onEditRelease }) => {
  // Sort releases by submission date (newest first)
  const sortedReleases = [...releases].sort((a, b) => {
      const dateA = new Date(a.submissionDate || 0).getTime();
      const dateB = new Date(b.submissionDate || 0).getTime();
      return dateB - dateA;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500">My Release History</h2>
        <p className="text-slate-400 mt-2">Track the status and history of all your submissions.</p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 p-8">
        {sortedReleases.length === 0 ? (
          <div className="text-center py-10">
              <p className="text-slate-400 text-lg">You haven't submitted any releases yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReleases.map(release => (
              <div key={release.id} className="flex flex-col sm:flex-row items-center justify-between bg-slate-800/30 border border-white/5 p-4 rounded-xl hover:bg-slate-800/50 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 group">
                <div className="flex items-center space-x-5 mb-4 sm:mb-0 w-full sm:w-auto">
                  <div className="relative">
                    <img src={release.artworkPreview} alt={release.songTitle} className="w-20 h-20 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 rounded-lg shadow-inner border border-white/10 pointer-events-none"></div>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-xl truncate text-white group-hover:text-cyan-300 transition-colors" title={release.songTitle}>{release.songTitle}</h3>
                    <p className="text-sm text-slate-400 font-medium">{release.artistName}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                        <span>Submitted: <strong className="text-slate-300">{formatDate(release.submissionDate)}</strong></span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span>Release: <strong className="text-slate-300">{formatDate(release.releaseDate)}</strong></span>
                        {release.statusUpdateDate && (
                            <>
                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                <span>Reviewed: <strong className="text-slate-300">{formatDate(release.statusUpdateDate)}</strong></span>
                            </>
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <StatusBadge status={release.status} />
                  
                  {/* Edit Button */}
                  {onEditRelease && (
                      <button 
                        onClick={() => onEditRelease(release)}
                        className="flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                        title="Edit Release"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                  )}

                  {release.status === ReleaseStatus.APPROVED && (
                    <button 
                      onClick={() => onViewDashboard(release)}
                      className="flex items-center text-sm font-semibold text-cyan-400 hover:text-cyan-200 transition-colors group/btn"
                    >
                      View Progress <ArrowRightIcon className="h-4 w-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};