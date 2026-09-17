import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Archive } from 'lucide-react';

interface TreasureChestProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isDismissed: boolean;
}

export const TreasureChest: React.FC<TreasureChestProps> = ({
  isOpen,
  onToggle,
  onClose,
  isDismissed,
}) => {
  if (isDismissed) return null;

  return (
    <div className="relative inline-flex items-center">
      {/* Speech Bubble Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click dismisses and permanently closes treasure */}
            <div
              className="fixed inset-0 z-40"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8, filter: 'blur(4px)' }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="absolute bottom-full left-0 mb-3 z-50 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl shadow-pink-200/50 border-2 border-pink-200 text-pink-900 min-w-[200px] max-w-[260px] select-none"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-pink-800 tracking-wide leading-snug">
                  YES ur special...
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-pink-400 hover:text-pink-600 transition-colors p-0.5 rounded-full cursor-pointer flex-shrink-0 active:scale-90"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speech bubble pointer */}
              <div className="absolute -bottom-1.5 left-3 sm:left-4 w-3.5 h-3.5 bg-white/95 border-b-2 border-r-2 border-pink-200 rotate-45 pointer-events-none" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Vector Treasure Chest Button (No emoji, No sparkles, Lid does not turn) */}
      <motion.button
        id="treasure-chest-btn"
        type="button"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{
          opacity: 0,
          scale: 0.2,
          filter: 'blur(6px)',
          transition: { duration: 0.35, ease: 'easeInOut' },
        }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        title={isOpen ? 'Close chest' : 'Treasure chest'}
        aria-label="Treasure chest"
        className={`relative z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg border-2 ${
          isOpen
            ? 'bg-pink-100 border-pink-300 text-pink-700 shadow-pink-300/50'
            : 'bg-white/90 hover:bg-white border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700 shadow-pink-200/50'
        }`}
      >
        {/* Animated Treasure Chest icon on opening (smooth bounce pop, lid does not rotate) */}
        <motion.div
          animate={
            isOpen
              ? {
                  scale: [1, 1.25, 1.08],
                  y: [0, -2.5, -1],
                }
              : { scale: 1, y: 0 }
          }
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 18,
          }}
          className="flex items-center justify-center"
        >
          <Archive className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </motion.div>
      </motion.button>
    </div>
  );
};
