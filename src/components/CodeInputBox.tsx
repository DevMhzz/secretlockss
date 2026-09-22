import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface CodeInputBoxProps {
  onUnlock: () => void;
  isUnlocked: boolean;
}

export const CodeInputBox: React.FC<CodeInputBoxProps> = ({
  onUnlock,
  isUnlocked,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (!isUnlocked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isUnlocked]);

  const handleSubmit = (val?: string) => {
    const code = (val !== undefined ? val : inputVal).trim().toLowerCase();
    
    if (!code) return;

    if (code === 'ilyyy') {
      onUnlock();
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setInputVal('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3.5">
      {/* 1. Code UI Card (Clean, strictly only the input and enter button) */}
      <motion.div
        id="code-input-container"
        animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-pink-200"
      >
        {/* Decorative Sanrio-style Bow on top center */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 select-none pointer-events-none drop-shadow-md">
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-300" />
            </div>
            {/* Bow left wing */}
            <div className="absolute -left-5 w-7 h-9 bg-rose-500 rounded-2xl -rotate-12 border-2 border-white -z-10 shadow" />
            {/* Bow right wing */}
            <div className="absolute -right-5 w-7 h-9 bg-rose-500 rounded-2xl rotate-12 border-2 border-white -z-10 shadow" />
          </div>
        </div>

        {/* Input Display Box: strictly showing just "type code here.." */}
        <div className="relative mt-4 mb-4">
          <div className="relative flex items-center bg-pink-50/90 border-2 border-pink-300 rounded-2xl px-5 py-4 focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-100 transition-all shadow-inner">
            <input
              id="secret-code-input"
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="type code here.."
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              maxLength={16}
              className="w-full bg-transparent text-center text-2xl font-bold tracking-widest text-pink-700 placeholder-pink-300/80 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          id="unlock-submit-btn"
          type="button"
          onClick={() => handleSubmit()}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-bold text-base shadow-lg shadow-pink-300/60 hover:shadow-pink-400/80 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white/60"
        >
          <span>enter</span>
        </button>
      </motion.div>

      {/* 2. Permanent Hint Underneath the Code UI (Not in it, doesn't disappear) */}
      <div
        id="permanent-hint-box"
        className="w-full max-w-sm px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-pink-200 shadow-lg shadow-pink-200/50 text-center select-none"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-pink-500 block mb-0.5">
          Hint
        </span>
        <p className="text-xs sm:text-sm font-semibold text-pink-800 leading-snug break-words">
          code bottom barrel btw
        </p>
      </div>
    </div>
  );
};
