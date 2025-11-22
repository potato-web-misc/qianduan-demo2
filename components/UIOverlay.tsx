import React from 'react';
import { ArrowRight, Star, Globe, Zap, ChevronLeft, Github, Twitter, Share2 } from 'lucide-react';

interface UIOverlayProps {
  onExplore: () => void;
  onReturn: () => void;
  isExploring: boolean;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ onExplore, onReturn, isExploring }) => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 md:p-12 transition-opacity duration-500 pointer-events-none">
      
      {/* Header / Nav */}
      <header className={`flex justify-between items-center transition-all duration-500 pointer-events-auto ${isExploring ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">ASTRA<span className="text-accent-400">.IO</span></span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            <a href="#" className="hover:text-white transition-colors">Gallery</a>
            <a href="#" className="hover:text-white transition-colors">Technology</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
        </nav>
        <div className="flex gap-4">
             <button className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5"/></button>
             <button className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5"/></button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative flex-grow flex items-center">
        
        {/* Hero Section (Home) */}
        <div className={`w-full md:w-2/3 lg:w-1/2 transition-all duration-700 transform pointer-events-auto ${isExploring ? 'opacity-0 -translate-x-20 pointer-events-none absolute' : 'opacity-100 translate-x-0 relative'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-accent-400 mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></span>
                Interactive 3D Experience
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 leading-tight mb-6 drop-shadow-lg">
                Explore the <br/>
                Infinite Cosmos
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
                Immerse yourself in a procedurally generated universe of particles and light. Experience the beauty of digital astronomy right in your browser.
            </p>
            
            <div className="flex flex-wrap gap-4">
                <button 
                    onClick={onExplore}
                    className="group relative px-8 py-3 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Start Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
                <button className="px-8 py-3 bg-transparent border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all backdrop-blur-sm">
                    Learn More
                </button>
            </div>

            {/* Stats / Features */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
                <div>
                    <div className="text-2xl font-bold text-white">5k+</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Particles</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">60</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">FPS</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">∞</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Possibilities</div>
                </div>
            </div>
        </div>

        {/* Explore Mode UI (Appears when Explore is clicked) */}
        {/* IMPORTANT: The container is pointer-events-none to let clicks pass through to canvas, only internal interactive elements have pointer-events-auto */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 pointer-events-none ${isExploring ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <div className={`text-center space-y-6 ${isExploring ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                <Globe className="w-16 h-16 text-accent-400 mx-auto animate-pulse-slow" />
                <h2 className="text-4xl font-light text-white tracking-[0.2em]">DEEP SPACE</h2>
                <p className="text-blue-200/60 max-w-md mx-auto">
                    Use your mouse to navigate the nebula. The universe is vast and constantly expanding.
                </p>
                <div className="pt-8">
                     <button 
                        onClick={onReturn}
                        className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
                    >
                        <ChevronLeft className="w-4 h-4" /> Return to Orbit
                     </button>
                </div>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`flex justify-between items-end transition-opacity duration-500 pointer-events-auto ${isExploring ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="text-xs text-gray-600">
            © 2024 Astra Technologies. All rights reserved.<br/>
            Rendered with React Three Fiber.
        </div>
        <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-accent-400/50 transition-colors backdrop-blur-md">
                    <Zap className="w-5 h-5 text-accent-400" />
                </div>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Fast</span>
            </div>
             <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-accent-400/50 transition-colors backdrop-blur-md">
                    <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Global</span>
            </div>
             <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-accent-400/50 transition-colors backdrop-blur-md">
                    <Share2 className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Share</span>
            </div>
        </div>
      </footer>
    </div>
  );
};
