import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, RotateCcw } from 'lucide-react';

interface UnlockedCelebrationProps {
  onRelock: () => void;
}

interface PhraseItem {
  id: string;
  text: string;
  durationMs: number;
  isPause?: boolean;
  staggerWords?: boolean;
}

const CINEMATIC_SEQUENCE: PhraseItem[] = [
  // 1. "you know you meant it." with slow word-by-word stagger & slow warm fade
  {
    id: 'p1',
    text: 'you know you meant it.',
    durationMs: 5200,
    staggerWords: true,
  },
  {
    id: 'p2',
    text: 'i meant it too…',
    durationMs: 4600,
    staggerWords: true,
  },
  {
    id: 'p3',
    text: 'i know you care…',
    durationMs: 4600,
    staggerWords: true,
  },
  {
    id: 'p4',
    text: 'but i also care about you.',
    durationMs: 5200,
    staggerWords: true,
  },
  // The 2-second blank pause where screen stays peaceful
  {
    id: 'pause_1',
    text: '',
    durationMs: 2000,
    isPause: true,
  },
  {
    id: 'p5',
    text: 'probably more than i should.',
    durationMs: 5000,
    staggerWords: true,
  },
  // Brief pause
  {
    id: 'pause_2',
    text: '',
    durationMs: 1400,
    isPause: true,
  },
  {
    id: 'p6',
    text: 'and honestly…',
    durationMs: 4200,
    staggerWords: true,
  },
  {
    id: 'p7',
    text: "i don't think i've ever been this sure about someone.",
    durationMs: 5600,
  },
  // Brief pause before final line
  {
    id: 'pause_3',
    text: '',
    durationMs: 1500,
    isPause: true,
  },
  {
    id: 'p8',
    text: 'so if you were waiting for me to say it…',
    durationMs: 5000,
  },
  // Final line stays on screen with warm bloom
  {
    id: 'p_final',
    text: "i'm choosing you.",
    durationMs: 0,
    staggerWords: true,
  },
];

export const UnlockedCelebration: React.FC<UnlockedCelebrationProps> = ({
  onRelock,
}) => {
  const [index, setIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    clearTimer();

    const current = CINEMATIC_SEQUENCE[index];
    if (!current) return;

    if (current.durationMs > 0) {
      timerRef.current = setTimeout(() => {
        setIndex((prev) => Math.min(prev + 1, CINEMATIC_SEQUENCE.length - 1));
      }, current.durationMs);
    } else {
      // Reached final line: reveal controls gently after 2s
      timerRef.current = setTimeout(() => {
        setShowControls(true);
      }, 2000);
    }

    return () => clearTimer();
  }, [index]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();
    setShowControls(false);
    setIndex(0);
  };

  const handleRelock = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();
    onRelock();
  };

  // Tap anywhere to smoothly advance to the next line
  const handleAdvance = () => {
    clearTimer();
    if (index < CINEMATIC_SEQUENCE.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      setShowControls(true);
    }
  };

  const currentItem = CINEMATIC_SEQUENCE[index];
  const isFinal = index === CINEMATIC_SEQUENCE.length - 1;
  const isFirst = currentItem?.id === 'p1';

  return (
    <div
      onClick={handleAdvance}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden bg-[#fff4f7] text-pink-950 cursor-pointer"
      title="Tap anywhere to advance"
    >
      {/* Soft Ambient Warm Heartbeat / Glow in the background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{
            duration: 4.0,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-[520px] h-[520px] rounded-full bg-pink-200/50 blur-3xl"
        />
      </div>

      {/* Cinematic Text Container */}
      <div className="relative z-10 w-full max-w-3xl px-6 sm:px-10 text-center min-h-[170px] sm:min-h-[220px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentItem && !currentItem.isPause && currentItem.text ? (
            <motion.h1
              key={currentItem.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                filter: 'blur(14px)',
                y: -10,
                transition: { duration: 1.15, ease: 'easeInOut' },
              }}
              className={`font-serif italic text-pink-900 tracking-wide break-words text-balance mx-auto drop-shadow-[0_4px_28px_rgba(244,114,182,0.28)] ${
                isFinal
                  ? 'text-4xl sm:text-6xl md:text-7xl leading-tight text-pink-950 drop-shadow-[0_6px_36px_rgba(244,114,182,0.42)]'
                  : currentItem.text.length > 35
                  ? 'text-xl sm:text-3xl md:text-4xl lg:text-5xl leading-snug sm:leading-relaxed'
                  : 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-relaxed'
              }`}
            >
              {currentItem.staggerWords ? (
                // Word-by-word slow emotional reveal that lowkey hits
                <span className="inline-block">
                  {currentItem.text.split(' ').map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{
                        opacity: 0,
                        y: 14,
                        filter: 'blur(12px)',
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: 'blur(0px)',
                        scale: 1,
                      }}
                      transition={{
                        duration: isFirst ? 1.3 : 1.1,
                        delay: i * (isFirst ? 0.22 : 0.16),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={`inline-block mr-[0.28em] last:mr-0 ${
                        isFirst ? 'transition-transform hover:scale-105' : ''
                      }`}
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
              ) : (
                // Whole phrase slow fade with deep blur dissolve
                <motion.span
                  initial={{
                    opacity: 0,
                    y: 12,
                    filter: 'blur(14px)',
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                  }}
                  transition={{
                    duration: 1.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {currentItem.text}
                </motion.span>
              )}
            </motion.h1>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Floating subtle replay & lock controls beneath final line */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute bottom-10 sm:bottom-12 z-20 flex items-center justify-center gap-3 sm:gap-4"
          >
            <button
              type="button"
              onClick={handleReplay}
              className="px-5 py-2.5 rounded-full bg-white/95 hover:bg-white text-pink-700 text-xs sm:text-sm font-semibold border border-pink-200 hover:border-pink-300 shadow-md shadow-pink-200/50 backdrop-blur-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-pink-500" />
              <span>replay</span>
            </button>

            <button
              id="relock-btn"
              type="button"
              onClick={handleRelock}
              className="px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-pink-300/40"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white/90" />
              <span>lock again</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
