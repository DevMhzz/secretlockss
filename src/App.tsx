import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { CodeInputBox } from './components/CodeInputBox';
import { UnlockedCelebration } from './components/UnlockedCelebration';
import { PlushieCompanion } from './components/PlushieCompanion';
import { Decorations } from './components/Decorations';
import { BackgroundMusic } from './components/BackgroundMusic';
import { TreasureChest } from './components/TreasureChest';

// Hello Kitty Plushie Assets
import plushiePeek from './assets/images/hk_plushie_peek_1789355261949.jpg';
import plushieCozy from './assets/images/hk_plushie_cozy_1789355274608.jpg';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showSecretHint, setShowSecretHint] = useState(false);
  const [showTreasure, setShowTreasure] = useState(false);
  const [isTreasureDismissed, setIsTreasureDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('secret_treasure_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Cross-browser persistence: sync treasure status on load
  useEffect(() => {
    fetch('/api/treasure/status')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.dismissed) {
          setIsTreasureDismissed(true);
          try {
            localStorage.setItem('secret_treasure_dismissed', 'true');
          } catch {}
        }
      })
      .catch(() => {
        // Fallback gracefully to localStorage if offline
      });
  }, []);

  const handleCloseTreasure = () => {
    setShowTreasure(false);
    setIsTreasureDismissed(true);

    // Save in local storage
    try {
      localStorage.setItem('secret_treasure_dismissed', 'true');
    } catch {}

    // Save in server so it NEVER appears in any other browser
    fetch('/api/treasure/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Background kawaii decor */}
      <Decorations />

      {/* Low-volume ambient background music */}
      <BackgroundMusic isUnlocked={isUnlocked} />

      {/* Main Center Area */}
      <main className="relative z-10 w-full max-w-5xl my-auto py-6 flex flex-col items-center justify-center">
        {/* SURROUNDING HELLO KITTY PLUSHIES: ONLY SHOWN WHEN NOT UNLOCKED */}
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div
              key="surrounding-plushies-group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* 1. Top Left Plushie (Desktop floating / Peeking) */}
              <div className="hidden lg:block absolute -top-4 left-4 xl:-left-6 w-36 h-36 z-20 animate-float">
                <PlushieCompanion
                  id="top-left"
                  imageSrc={plushiePeek}
                  alt="Peeking Hello Kitty Plushie"
                  pose="peeking"
                />
              </div>

              {/* 2. Top Right Plushie (Desktop floating / Cozy) */}
              <div className="hidden lg:block absolute -top-4 right-4 xl:-right-6 w-36 h-36 z-20 animate-float-delayed">
                <PlushieCompanion
                  id="top-right"
                  imageSrc={plushieCozy}
                  alt="Cozy Hello Kitty Plushie"
                  pose="sitting"
                />
              </div>

              {/* 3. Bottom Left Plushie (Desktop / Cozy sitting) */}
              <div className="hidden lg:block absolute -bottom-6 left-6 xl:-left-4 w-40 h-40 z-20 animate-float-slow">
                <PlushieCompanion
                  id="bottom-left"
                  imageSrc={plushieCozy}
                  alt="Hello Kitty Plushie Sitting"
                  pose="sitting"
                />
              </div>

              {/* 4. Bottom Right Plushie (Desktop / Peeking corner) */}
              <div className="hidden lg:block absolute -bottom-6 right-6 xl:-right-4 w-36 h-36 z-20 animate-float">
                <PlushieCompanion
                  id="bottom-right"
                  imageSrc={plushiePeek}
                  alt="Hello Kitty Plushie Friend"
                  pose="peeking"
                />
              </div>

              {/* Mobile / Tablet Horizontal Plushies Row */}
              <div className="flex lg:hidden items-center justify-center gap-3 sm:gap-6 mb-4 select-none">
                <div className="w-20 h-20 sm:w-24 sm:h-24">
                  <PlushieCompanion
                    id="mobile-1"
                    imageSrc={plushiePeek}
                    alt="Plushie Hello Kitty"
                    pose="peeking"
                  />
                </div>
                <div className="w-24 h-24 sm:w-28 sm:h-28">
                  <PlushieCompanion
                    id="mobile-2"
                    imageSrc={plushieCozy}
                    alt="Plushie Hello Kitty Sitting"
                    pose="sitting"
                  />
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24">
                  <PlushieCompanion
                    id="mobile-3"
                    imageSrc={plushiePeek}
                    alt="Plushie Hello Kitty Side"
                    pose="peeking"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Interactive Card: Code Input Box OR Clean Unlocked Text */}
        <div className="w-full relative z-10">
          <AnimatePresence mode="wait">
            {!isUnlocked ? (
              <motion.div
                key="locked-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <CodeInputBox
                  onUnlock={() => setIsUnlocked(true)}
                  isUnlocked={isUnlocked}
                />
              </motion.div>
            ) : (
              <motion.div
                key="unlocked-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <UnlockedCelebration
                  onRelock={() => setIsUnlocked(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Footer Credit */}
      {!isUnlocked && (
        <footer className="relative z-20 text-center py-3 select-none">
          <p className="text-xs sm:text-sm font-semibold text-pink-700/80 tracking-wide">
            made by mhz_ws
          </p>
        </footer>
      )}

      {/* Bottom Corner Left Question Mark & Treasure Buttons & Popups */}
      {!isUnlocked && (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40">
          <AnimatePresence>
            {showSecretHint && (
              <>
                {/* Invisible backdrop to dismiss popup when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSecretHint(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 8 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 320 }}
                  className="relative z-50 mb-3 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border-2 border-pink-200 text-pink-900 max-w-[260px] sm:max-w-xs select-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-pink-800 tracking-wide leading-snug">
                      psss u still owe me an answer..
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSecretHint(false)}
                      className="text-pink-400 hover:text-pink-600 transition-colors p-0.5 rounded-full cursor-pointer flex-shrink-0"
                      aria-label="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Speech bubble pointer */}
                  <div className="absolute -bottom-1.5 left-4 w-3.5 h-3.5 bg-white/95 border-b-2 border-r-2 border-pink-200 rotate-45 pointer-events-none" />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2.5">
            <motion.button
              id="question-hint-btn"
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setShowSecretHint((prev) => !prev);
                setShowTreasure(false);
              }}
              className="relative z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-pink-600 hover:text-pink-700 font-bold text-lg sm:text-xl shadow-lg shadow-pink-200/50 border-2 border-pink-200 hover:border-pink-300 flex items-center justify-center cursor-pointer transition-all"
              aria-label="Hint"
            >
              ?
            </motion.button>

            {/* Secret Animated Treasure Chest (Disappears forever once closed) */}
            <TreasureChest
              isOpen={showTreasure}
              onToggle={() => {
                setShowTreasure((prev) => !prev);
                setShowSecretHint(false);
              }}
              onClose={handleCloseTreasure}
              isDismissed={isTreasureDismissed}
            />
          </div>
        </div>
      )}
    </div>
  );
}
