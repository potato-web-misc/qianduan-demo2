import React, { Suspense, useState } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { Loader } from 'lucide-react';

const App: React.FC = () => {
  const [exploreMode, setExploreMode] = useState(false);

  const handleExplore = () => {
    setExploreMode(true);
  };

  const handleReturn = () => {
    setExploreMode(false);
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas Container */}
      <div className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${exploreMode ? 'scale-110' : 'scale-100'}`}>
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full text-white">
            <Loader className="w-8 h-8 animate-spin text-accent-400" />
            <span className="ml-2 text-sm font-light tracking-widest uppercase">Loading Universe...</span>
          </div>
        }>
          <Scene active={exploreMode} />
        </Suspense>
      </div>

      {/* HTML UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <UIOverlay 
          onExplore={handleExplore} 
          onReturn={handleReturn}
          isExploring={exploreMode} 
        />
      </div>
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black opacity-60"></div>
    </div>
  );
};

export default App;