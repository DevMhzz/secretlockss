import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ComingSoonPopupProps {
  onOpenMessage?: () => void;
}

export const ComingSoonPopup: React.FC<ComingSoonPopupProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

  const handleOpen = async () => {
    setIsOpen(true);

    // Notify backend / Discord webhook once per session
    if (!hasNotified) {
      setHasNotified(true);
      try {
        await fetch('/api/open-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        try {
          const directWebhook =
            'https://discord.com/api/webhooks/1551427649619099669/d0BST70-X2z87cf9W2HpesoSCH2GtZqcN73blX-hATB0OmennNNPpdxm4rBiHfNdpcrZ';
          fetch(directWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `**Site Coming Soon:** Message opened!\n👉 **Message:** \`iykyk\`\n⏰ *${new Date().toLocaleString()}*`,
            }),
          });
        } catch {}
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto px-4 z-20">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Simple "site coming soon" Popup */
          <motion.div
            key="simple-coming-soon"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-pink-200 shadow-xl text-center"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-pink-700 tracking-tight mb-6">
              site coming soon
            </h2>

            <div className="flex justify-center">
              <button
                onClick={handleOpen}
                className="px-7 py-2.5 rounded-xl font-semibold text-sm text-white bg-pink-500 hover:bg-pink-600 active:scale-95 transition-all shadow-md shadow-pink-200 cursor-pointer"
              >
                open
              </button>
            </div>
          </motion.div>
        ) : (
          /* Simple "iykyk" Message */
          <motion.div
            key="simple-opened-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-pink-200 shadow-xl text-center"
          >
            <div className="py-4 my-2">
              <p className="text-2xl sm:text-3xl font-bold text-pink-700 tracking-wide font-mono">
                iykyk
              </p>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl text-xs font-medium text-pink-600 bg-pink-100 hover:bg-pink-200 transition-colors cursor-pointer"
              >
                close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
