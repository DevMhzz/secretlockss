import React, { useState } from 'react';
import { motion } from 'motion/react';

interface PlushieProps {
  id: string;
  imageSrc: string;
  alt: string;
  className?: string;
  reactionPhrase?: string;
  pose?: 'sitting' | 'peeking' | 'floating';
}

export const PlushieCompanion: React.FC<PlushieProps> = ({
  id,
  imageSrc,
  alt,
  className = '',
  pose = 'sitting',
}) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
  };

  return (
    <div id={`plushie-${id}`} className={`relative select-none pointer-events-auto ${className}`}>
      {/* Plushie Figure with squish on click, no message popup */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: pose === 'peeking' ? 5 : 2 }}
        whileTap={{ scale: 0.95 }}
        animate={
          clicked
            ? { scale: [1, 1.2, 0.88, 1.08, 1], rotate: [0, -6, 6, -3, 0] }
            : {}
        }
        transition={{ duration: 0.4 }}
        onClick={handleClick}
        className="cursor-pointer group relative"
      >
        {/* Soft shadow */}
        <div className="absolute inset-x-4 -bottom-2 h-4 bg-pink-900/10 rounded-full blur-md group-hover:bg-pink-900/15 transition-all" />

        {/* Soft Plushie Outer Glow & Frame */}
        <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-b from-pink-200 via-pink-100 to-rose-200 shadow-xl border-2 border-white/80 transition-transform duration-300 group-hover:shadow-pink-300/50">
          <img
            src={imageSrc}
            alt={alt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
            draggable={false}
          />
          {/* Subtle felt/plush shine highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-white/40 pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
};
