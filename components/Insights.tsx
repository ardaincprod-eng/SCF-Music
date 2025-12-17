import React, { useMemo, useState } from 'react';
import { Release } from '../types';
import { ChartBarIcon, MusicNoteIcon, ArrowRightIcon } from './icons/Icons';

interface InsightsProps {
    releases: Release[];
}

interface DailyData {
    date: string;
    fullDate: Date;
    streams: number;
}

export const Insights: React.FC<InsightsProps> = ({ releases }) => {
    const [hoveredData, setHoveredData] = useState<DailyData | null>(null);

    // Generate mock daily data for the last 30 days based on release count
    const dailyData = useMemo(() => {
        const data: DailyData[] = [];
        const today = new Date();
        const baseStreams = releases.length > 0 ? releases.length * 150 : 0; // Baseline
        
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            
            // Create some random fluctuation but keep a trend
            const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
            // Add a "weekend" bump or dip effect just for variety
            const dayOfWeek = d.getDay();
            const weekendBoost = (dayOfWeek === 6 || dayOfWeek === 0) ? 1.15 : 1.0;

            const dailyCount = Math.floor(baseStreams * randomFactor * weekendBoost * (1 + (Math.random() * 20))); // Add noise
            
            data.push({
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: d,
                streams: dailyCount
            });
        }
        return data;
    }, [releases.length]);

    const totalStreamsLast30Days = dailyData.reduce((acc, curr) => acc + curr.streams, 0);
    const avgDailyStreams = Math.round(totalStreamsLast30Days / 30);
    const maxStreams = Math.max(...dailyData.map(d => d.streams), 100); // Prevent division by zero

    // SVG Chart Calculation
    const chartHeight = 300;
    const chartWidth = 800; // ViewBox width
    const padding = 20;
    const effectiveHeight = chartHeight - padding * 2;
    const effectiveWidth = chartWidth; // Full width

    const points = dailyData.map((d, i) => {
        const x = (i / (dailyData.length - 1)) * effectiveWidth;
        const y = chartHeight - padding - (d.streams / maxStreams) * effectiveHeight;
        return `${x},${y}`;
    }).join(' ');

    // Path for the area fill (closes the loop at the bottom)
    const areaPath = `${points} ${effectiveWidth},${chartHeight} 0,${chartHeight}`;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                        Audience Insights
                    </h2>
                    <p className="text-slate-400 mt-2">Daily streaming performance over the last 30 days.</p>
                </div>
                <div className="mt-4 md:mt-0 bg-slate-800/50 px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300">
                    Last 30 Days
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(79,70,229,0.1)] group">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                            <ChartBarIcon className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Streams (30d)</p>
                            <h3 className="text-3xl font-bold text-white">{totalStreamsLast30Days.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] group">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                            <ChartBarIcon className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Avg. Daily Listeners</p>
                            <h3 className="text-3xl font-bold text-white">{avgDailyStreams.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.1)] group">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/30 transition-colors">
                            <MusicNoteIcon className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Top Release</p>
                            <h3 className="text-xl font-bold text-white truncate max-w-[200px]">
                                {releases.length > 0 ? releases[0].songTitle : "N/A"}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-3 animate-pulse"></span>
                    Stream Growth
                </h3>

                {releases.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                        <ChartBarIcon className="h-12 w-12 mb-3 opacity-20" />
                        <p>No streaming data available yet.</p>
                        <p className="text-sm">Upload a release to start seeing insights.</p>
                    </div>
                ) : (
                    <div className="relative h-[300px] w-full group cursor-crosshair">
                        {/* Hover Overlay info */}
                        {hoveredData && (
                            <div 
                                className="absolute top-0 left-0 bg-slate-800/90 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-xl z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-all"
                                style={{ 
                                    left: `${(dailyData.indexOf(hoveredData) / (dailyData.length - 1)) * 100}%`, 
                                    top: `${chartHeight - padding - (hoveredData.streams / maxStreams) * effectiveHeight - 15}px`
                                }}
                            >
                                <p className="text-xs text-slate-400">{hoveredData.date}</p>
                                <p className="text-lg font-bold text-white">{hoveredData.streams.toLocaleString()} <span className="text-xs font-normal text-slate-400">streams</span></p>
                            </div>
                        )}

                        <svg 
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                            className="w-full h-full overflow-visible"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#38bdf8" />
                                    <stop offset="50%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                                <line 
                                    key={tick}
                                    x1="0" 
                                    y1={chartHeight - padding - (tick * effectiveHeight)} 
                                    x2={chartWidth} 
                                    y2={chartHeight - padding - (tick * effectiveHeight)} 
                                    stroke="rgba(255,255,255,0.05)" 
                                    strokeWidth="1" 
                                />
                            ))}

                            {/* Area Fill */}
                            <path 
                                d={`M${points.split(' ')[0]} L${areaPath} Z`} 
                                fill="url(#chartGradient)" 
                                stroke="none" 
                            />

                            {/* Line */}
                            <path 
                                d={`M ${points}`} 
                                fill="none" 
                                stroke="url(#lineGradient)" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                            />

                            {/* Data Points (Invisible for hit detection, Visible on Hover) */}
                            {dailyData.map((d, i) => {
                                const x = (i / (dailyData.length - 1)) * effectiveWidth;
                                const y = chartHeight - padding - (d.streams / maxStreams) * effectiveHeight;
                                return (
                                    <g key={i} onMouseEnter={() => setHoveredData(d)} onMouseLeave={() => setHoveredData(null)}>
                                        {/* Invisible wide circle for easier hovering */}
                                        <circle cx={x} cy={y} r="8" fill="transparent" />
                                        {/* Visible dot on hover */}
                                        <circle 
                                            cx={x} 
                                            cy={y} 
                                            r="4" 
                                            fill="white" 
                                            className={`transition-opacity duration-200 ${hoveredData === d ? 'opacity-100' : 'opacity-0'}`}
                                        />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="flex justify-between mt-2 px-2 text-xs text-slate-500 font-mono">
                            {dailyData.filter((_, i) => i % 6 === 0).map((d, i) => (
                                <span key={i}>{d.date}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Performance List */}
            {releases.length > 0 && (
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-xl font-bold text-white">Track Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/5">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Track</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Trend</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Streams</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {releases.slice(0, 5).map((release) => (
                                    <tr key={release.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-lg object-cover mr-4" src={release.artworkPreview} alt="" />
                                                <div>
                                                    <div className="text-sm font-bold text-white">{release.songTitle}</div>
                                                    <div className="text-xs text-slate-400">{release.artistName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="inline-flex items-center text-green-400 text-sm font-bold bg-green-500/10 px-2 py-1 rounded">
                                                <ArrowRightIcon className="h-3 w-3 mr-1 transform -rotate-45" />
                                                +{Math.floor(Math.random() * 15)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 font-mono">
                                            {(release.streams || 0 + Math.floor(Math.random() * 1000)).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};