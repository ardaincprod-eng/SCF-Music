import React from 'react';
import { 
    ArrowRightIcon, 
    GlobeIcon, 
    ChartBarIcon, 
    SparklesIcon, 
    UserGroupIcon, 
    CheckCircleIcon,
    ShieldCheckIcon
} from './icons/Icons.tsx';

interface HeroProps {
  onStartRelease: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartRelease }) => {
  return (
    <div className="relative">
      <section className="text-center py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        
        <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                    Müziğini Tüm Dünyaya
                </span>
                <br />
                <span className="text-white">
                    SCF Music ile Duyur.
                </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed px-4">
                Sınırsız yükleme, gelişmiş analitikler ve %70 telif koruması. 
                <span className="text-cyan-300 font-medium"> SCF Music</span> bağımsız sanatçılar için en hızlı dağıtım platformudur.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                onClick={onStartRelease}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-90 group-hover:opacity-100"></div>
                <span className="relative flex items-center">
                    Yayınlamaya Başla
                    <ArrowRightIcon className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                </button>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth'})} className="px-8 py-4 text-lg font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-full transition-all hover:bg-white/5">
                    Daha Fazla Bilgi
                </button>
            </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-slate-950/50 backdrop-blur-md py-8 overflow-hidden">
        <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Tüm büyük platformlarda yanındayız</p>
        <div className="flex justify-center items-center flex-wrap gap-8 md:gap-16 opacity-70">
            {['Spotify', 'Apple Music', 'TikTok', 'Instagram', 'YouTube Music', 'Amazon Music'].map((store) => (
                <span key={store} className="text-xl md:text-2xl font-bold text-slate-300 hover:text-white transition-transform cursor-default select-none">
                    {store}
                </span>
            ))}
        </div>
      </section>
    </div>
  );
};