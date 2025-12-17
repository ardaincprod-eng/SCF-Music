import React from 'react';
import { 
    ArrowRightIcon, 
    GlobeIcon, 
    ChartBarIcon, 
    SparklesIcon, 
    UserGroupIcon, 
    CheckCircleIcon,
    ShieldCheckIcon
} from './icons/Icons';

interface HeroProps {
  onStartRelease: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartRelease }) => {
  return (
    <div className="relative">
      
      {/* --- SECTION 1: HERO HEADER --- */}
      <section className="text-center py-20 sm:py-32 relative overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        
        <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                    Distribute Your Music
                </span>
                <br />
                <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    To The Universe.
                </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed px-4">
                Unlimited uploads, advanced analytics, and 70% royalty retention. 
                <span className="text-cyan-300 font-medium"> SCF Music</span> is the launchpad for your career.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                onClick={onStartRelease}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x opacity-90 group-hover:opacity-100"></div>
                <div className="absolute inset-0 w-full h-full blur-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <span className="relative flex items-center">
                    Start Your Release
                    <ArrowRightIcon className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                </button>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth'})} className="px-8 py-4 text-lg font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-full transition-all hover:bg-white/5">
                    Learn More
                </button>
            </div>
        </div>
      </section>

      {/* --- SECTION 2: PARTNERS MARQUEE --- */}
      <section className="border-y border-white/5 bg-slate-950/50 backdrop-blur-md py-8 overflow-hidden">
        <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Distributed to all major platforms</p>
        <div className="flex justify-center items-center flex-wrap gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {['Spotify', 'Apple Music', 'TikTok', 'Instagram', 'YouTube Music', 'Amazon Music', 'Tidal'].map((store) => (
                <span key={store} className="text-xl md:text-2xl font-bold text-slate-300 hover:text-white hover:scale-110 transition-transform cursor-default select-none">
                    {store}
                </span>
            ))}
        </div>
      </section>

      {/* --- SECTION 3: FEATURES GRID --- */}
      <section id="features" className="py-24 container mx-auto px-4 relative">
         <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] -z-10"></div>
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Everything you need to grow</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We provide the tools major labels use, made accessible for independent artists.</p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-slate-800/40 hover:border-cyan-500/30 transition-all group">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <GlobeIcon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Global Distribution</h3>
                <p className="text-slate-400 text-sm">Get your music on 150+ digital stores and streaming services worldwide instantly.</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-slate-800/40 hover:border-purple-500/30 transition-all group">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Team Splits</h3>
                <p className="text-slate-400 text-sm">Automatically split royalties with producers, bandmates, and collaborators. No math required.</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-slate-800/40 hover:border-pink-500/30 transition-all group">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Analytics</h3>
                <p className="text-slate-400 text-sm">Track your streams, downloads, and audience demographics in real-time.</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-slate-800/40 hover:border-yellow-500/30 transition-all group">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <SparklesIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Promotion</h3>
                <p className="text-slate-400 text-sm">Use our Gemini-powered AI tools to generate press releases, bios, and social posts.</p>
            </div>
         </div>
      </section>

      {/* --- SECTION 4: TRUST/STATS --- */}
      <section className="py-20 bg-gradient-to-b from-slate-900/50 to-slate-950/80 border-y border-white/5 relative">
         <div className="container mx-auto px-4">
             <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                 <div className="p-4">
                     <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">70%</p>
                     <p className="text-cyan-400 font-medium uppercase tracking-wider text-sm">Royalties Kept</p>
                 </div>
                 <div className="p-4">
                     <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">10k+</p>
                     <p className="text-purple-400 font-medium uppercase tracking-wider text-sm">Artists Trusted</p>
                 </div>
                 <div className="p-4">
                     <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">24/7</p>
                     <p className="text-pink-400 font-medium uppercase tracking-wider text-sm">Support Team</p>
                 </div>
             </div>
         </div>
      </section>
      
      {/* --- SECTION 5: HOW IT WORKS --- */}
      <section className="py-24 container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
              {[
                  { title: "Upload", desc: "Upload your tracks, artwork, and metadata in minutes.", step: "01" },
                  { title: "Distribute", desc: "We send your music to Spotify, Apple Music, and 150+ stores.", step: "02" },
                  { title: "Earn", desc: "Get paid monthly and keep 70% of your earnings.", step: "03" }
              ].map((item, idx) => (
                  <div key={idx} className="relative p-8 rounded-3xl bg-slate-900/30 border border-white/5 overflow-hidden group hover:border-white/20 transition-all">
                      <div className="absolute -right-4 -top-4 text-9xl font-bold text-white/5 group-hover:text-white/10 transition-colors select-none">
                          {item.step}
                      </div>
                      <div className="relative z-10">
                          <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                          <p className="text-slate-400">{item.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* --- SECTION 6: FINAL CTA --- */}
      <section className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to make noise?</h2>
            <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">Join thousands of independent artists who trust SCF Music to manage their careers.</p>
            <button
                onClick={onStartRelease}
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-white/5 border border-white/10 overflow-hidden rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-white/30"
            >
                <span className="relative flex items-center">
                    Get Started for Free
                    <ArrowRightIcon className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
            </button>
        </div>
      </section>
    </div>
  );
};