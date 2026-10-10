import React from 'react';
import { Decorations } from './components/Decorations';
import { BackgroundMusic } from './components/BackgroundMusic';
import { ComingSoonPopup } from './components/ComingSoonPopup';

export default function App() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 overflow-hidden select-none">
      {/* Background kawaii decor (floating petals, sparkles, hearts) */}
      <Decorations />

      {/* Low-volume ambient background music ("U Fancy ?") */}
      <BackgroundMusic />

      {/* Main Center Area: "site coming soon??" Popup with "open" button -> message "iykyk" */}
      <main className="relative z-10 w-full max-w-xl my-auto py-8 flex flex-col items-center justify-center">
        <ComingSoonPopup />
      </main>

      {/* Bottom Footer Credit */}
      <footer className="relative z-20 text-center py-3 select-none">
        <p className="text-xs sm:text-sm font-semibold text-pink-700/80 tracking-wide">
          made by mhz_ws
        </p>
      </footer>
    </div>
  );
}
