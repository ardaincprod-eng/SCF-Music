import React from 'react';
import { Release } from '../types';
import { CurrencyDollarIcon, BanknotesIcon } from './icons/Icons';

interface PayoutsProps {
  releases: Release[];
}

export const Payouts: React.FC<PayoutsProps> = ({ releases }) => {
    // Map releases to ensure streams and revenue default to 0 if undefined
    const payoutData = releases.map(release => ({
        ...release,
        streams: release.streams || 0,
        revenue: release.revenue || 0,
    }));

    const totalEarnings = payoutData.reduce((sum, data) => sum + data.revenue, 0);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Payouts Dashboard</h2>
                <p className="text-slate-400 mt-2">Track your earnings and manage your payouts.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center space-x-4 shadow-[0_0_20px_rgba(34,197,94,0.1)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
                    <div className="bg-green-500/20 p-4 rounded-full border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                        <CurrencyDollarIcon className="h-8 w-8 text-green-300" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-slate-400">Total Earnings</p>
                        <p className="text-2xl font-bold text-white drop-shadow-md">{totalEarnings.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center space-x-4 shadow-[0_0_20px_rgba(59,130,246,0.1)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                    <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        <BanknotesIcon className="h-8 w-8 text-blue-300" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-slate-400">Last Payout</p>
                        <p className="text-2xl font-bold text-white drop-shadow-md">{(0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                         <p className="text-xs text-slate-500">No previous payouts</p>
                    </div>
                </div>
                 <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col justify-center shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
                        Request Payout
                    </button>
                    <p className="text-xs text-slate-500 mt-3 text-center">Next payout on <span className="text-slate-300">{new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></p>
                </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                 <h3 className="text-xl font-semibold p-6 border-b border-white/5 bg-slate-950/30">Earnings by Release</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Release</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Streams</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {payoutData.length > 0 ? payoutData.map(data => (
                                <tr key={data.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-lg object-cover shadow-sm border border-white/5" src={data.artworkPreview} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-white">{data.songTitle}</div>
                                                <div className="text-xs text-slate-400">{data.artistName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 font-mono">{data.streams.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-400 font-bold font-mono shadow-green-500/50 drop-shadow-sm">{data.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                        You have no approved releases with earnings yet.
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