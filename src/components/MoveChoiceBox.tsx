import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BowArrow, X, Check, Heart, Loader2 } from 'lucide-react';

interface MoveChoiceBoxProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const MoveChoiceBox: React.FC<MoveChoiceBoxProps> = ({
  isOpen,
  onToggle,
  onClose,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<'good' | 'awful' | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const DISCORD_WEBHOOK =
    'https://discord.com/api/webhooks/1551427649619099669/d0BST70-X2z87cf9W2HpesoSCH2GtZqcN73blX-hATB0OmennNNPpdxm4rBiHfNdpcrZ';

  const handleChoice = async (choice: 'good' | 'awful') => {
    setSelectedChoice(choice);
    setStatus('sending');

    try {
      // 1. Try sending via backend server endpoint
      const res = await fetch('/api/make-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
      });

      if (!res.ok) {
        // 2. Direct client fallback if server fails
        await fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `💌 **Question:** howss ur dayyy??\n👉 **Answer:** \`${choice}\`\n⏰ *${new Date().toLocaleString()}*`,
          }),
        });
      }

      setStatus('sent');
    } catch {
      // Direct client fallback
      try {
        await fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `💌 **Question:** howss ur dayyy??\n👉 **Answer:** \`${choice}\`\n⏰ *${new Date().toLocaleString()}*`,
          }),
        });
        setStatus('sent');
      } catch (err) {
        console.error('Failed to notify Discord webhook:', err);
        setStatus('sent');
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Popup Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close when clicking outside */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8, filter: 'blur(4px)' }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="absolute bottom-full left-0 mb-3 z-50 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-pink-200/50 border-2 border-pink-200 text-pink-900 min-w-[240px] max-w-[280px] sm:max-w-xs select-none"
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 text-pink-600">
                  <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pink-500">
                    Question
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-pink-400 hover:text-pink-600 transition-colors p-0.5 rounded-full cursor-pointer flex-shrink-0 active:scale-90"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Question Text */}
              <p className="text-sm font-bold text-pink-900 tracking-tight leading-snug mb-3.5">
                howss ur dayyy??
              </p>

              {/* Options good or awful */}
              <div className="grid grid-cols-2 gap-2.5">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice('good')}
                  disabled={status === 'sending'}
                  className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    selectedChoice === 'good'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-pink-300/60 ring-2 ring-pink-400 ring-offset-1'
                      : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-2 border-pink-200 shadow-pink-100/50'
                  }`}
                >
                  {status === 'sending' && selectedChoice === 'good' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : selectedChoice === 'good' && status === 'sent' ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : null}
                  good
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice('awful')}
                  disabled={status === 'sending'}
                  className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    selectedChoice === 'awful'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-pink-300/60 ring-2 ring-pink-400 ring-offset-1'
                      : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-2 border-pink-200 shadow-pink-100/50'
                  }`}
                >
                  {status === 'sending' && selectedChoice === 'awful' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : selectedChoice === 'awful' && status === 'sent' ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : null}
                  awful
                </motion.button>
              </div>

              {/* Speech bubble pointer */}
              <div className="absolute -bottom-1.5 left-4 w-3.5 h-3.5 bg-white/95 border-b-2 border-r-2 border-pink-200 rotate-45 pointer-events-none" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bow and Arrow Button */}
      <motion.button
        id="bow-arrow-btn"
        type="button"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        title={isOpen ? 'Close' : "How's your day?"}
        aria-label="How's your day?"
        className={`relative z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg border-2 ${
          isOpen
            ? 'bg-pink-100 border-pink-300 text-pink-700 shadow-pink-300/50'
            : 'bg-white/90 hover:bg-white border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700 shadow-pink-200/50'
        }`}
      >
        <motion.div
          animate={isOpen ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 16 }}
          className="flex items-center justify-center"
        >
          <BowArrow className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </motion.div>
      </motion.button>
    </div>
  );
};
