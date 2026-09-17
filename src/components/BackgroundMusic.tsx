import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Play, Pause, Music, ChevronRight } from 'lucide-react';

interface BackgroundMusicProps {
  isUnlocked?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Fixed comfortable ambient volume (fits the gentle aesthetic)
const FIXED_VOLUME = 20;

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ isUnlocked = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default into cute music icon
  const playerRef = useRef<any>(null);
  const audioUnlockedRef = useRef(false);

  // Helper to trigger playback and ensure sound is unmuted at FIXED_VOLUME
  const ensurePlayback = () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      // If user hasn't manually muted, unmute and set comfortable volume
      if (!isMuted && typeof player.unMute === 'function') {
        player.unMute();
        player.setVolume(FIXED_VOLUME);
      }
      if (typeof player.playVideo === 'function') {
        player.playVideo();
      }
    } catch (err) {
      console.warn('Playback attempt:', err);
    }
  };

  // Load YouTube IFrame API script once
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player('yt-bg-music-player', {
          height: '1',
          width: '1',
          videoId: 'yexrZOIhvAQ', // Nine Vicious - Sing To Your Heart
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: 'yexrZOIhvAQ',
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
            disablekb: 1,
            fs: 0,
            rel: 0,
            enablejsapi: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;

              // Ensure the created iframe element allows uninhibited autoplay
              try {
                const iframe = event.target.getIframe?.() || document.getElementById('yt-bg-music-player');
                if (iframe) {
                  iframe.setAttribute('allow', 'autoplay *; encrypted-media *');
                }
              } catch {}

              // Try playing unmuted immediately on load
              try {
                event.target.unMute();
                event.target.setVolume(FIXED_VOLUME);
                event.target.playVideo();
                setIsPlaying(true);
              } catch {
                // If browser autoplay policy requires an initial gesture, play muted first so it is running
                try {
                  event.target.mute();
                  event.target.playVideo();
                } catch {}
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                // When playing, make sure it is unmuted unless explicitly muted by user
                if (!isMuted) {
                  try {
                    event.target.unMute();
                    event.target.setVolume(FIXED_VOLUME);
                  } catch {}
                }
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo(); // Seamless loop
              }
            },
          },
        });
      } catch (err) {
        console.warn('YT player error', err);
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else if (window.YT.Player) {
      initPlayer();
    }

    return () => {
      isMounted = false;
    };
  }, [isMuted]);

  // Comprehensive browser autoplay listener:
  // As soon as the user enters the site and moves the mouse, taps, scrolls, or types,
  // the music automatically starts unmuted with zero need to touch volume.
  useEffect(() => {
    const handleUserPresence = () => {
      if (!audioUnlockedRef.current) {
        audioUnlockedRef.current = true;
      }
      ensurePlayback();
    };

    // Listen to all common user presence events
    const events = [
      'pointerdown',
      'pointermove',
      'mousemove',
      'mousedown',
      'touchstart',
      'keydown',
      'scroll',
      'wheel',
      'click',
      'focus',
    ];

    events.forEach((evt) => window.addEventListener(evt, handleUserPresence, { passive: true }));

    // Periodic safety check: if player is ready but hasn't started, retry playback automatically
    const intervalId = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
        const state = playerRef.current.getPlayerState();
        if (state !== 1) { // 1 = PLAYING
          ensurePlayback();
        }
      }
    }, 1200);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserPresence));
      clearInterval(intervalId);
    };
  }, [isMuted]);

  // Sync mute updates
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(FIXED_VOLUME);
        }
      } catch {
        // Player not ready yet
      }
    }
  }, [isMuted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      try {
        if (isPlaying) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(FIXED_VOLUME);
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  return (
    <>
      {/* Hidden YouTube Iframe Player with explicit autoplay permissions */}
      <div
        id="yt-bg-music-player"
        className="pointer-events-none opacity-0 fixed -top-40 -left-40 w-1 h-1 overflow-hidden"
        aria-hidden="true"
      />

      {/* Floating Music Widget Container */}
      <div
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* HIDDEN/COLLAPSED STATE: Cute circular music icon */
            <motion.button
              key="music-icon-collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => setIsExpanded(true)}
              title="Music player (click to open)"
              aria-label="Open background music controls"
              className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-md border shadow-md transition-all ${
                isUnlocked
                  ? 'bg-white/90 border-pink-200/90 text-pink-700 shadow-pink-200/40 hover:bg-white'
                  : 'bg-white/95 border-pink-200 text-pink-600 shadow-pink-200/50 hover:bg-white'
              }`}
            >
              <Music className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
            </motion.button>
          ) : (
            /* EXPANDED STATE: Complete player pill with hide button */
            <motion.div
              key="music-pill-expanded"
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full backdrop-blur-md border shadow-lg transition-all ${
                isUnlocked
                  ? 'bg-white/95 border-pink-200 shadow-pink-200/40 text-pink-900'
                  : 'bg-white/95 border-pink-200 shadow-pink-200/50 text-pink-800'
              }`}
            >
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className="w-7 h-7 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-600 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 active:scale-95"
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-pink-500" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-pink-500 translate-x-[0.5px]" />
                )}
              </button>

              {/* Animated Equalizer Visualizer */}
              <div
                className="flex items-center gap-[2.5px] h-3.5 cursor-pointer px-0.5"
                onClick={togglePlay}
                title="sing to your heart"
              >
                {[0.4, 0.9, 0.6, 0.75].map((scale, i) => (
                  <motion.span
                    key={i}
                    animate={
                      isPlaying && !isMuted
                        ? {
                            scaleY: [0.3, scale, 0.2, 0.9, 0.4],
                            opacity: [0.6, 1, 0.7, 1, 0.6],
                          }
                        : { scaleY: 0.25, opacity: 0.4 }
                    }
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: i * 0.18,
                      ease: 'easeInOut',
                    }}
                    className="w-[2.5px] h-3 bg-pink-400 rounded-full origin-bottom"
                  />
                ))}
              </div>

              {/* Track Title */}
              <span
                className="text-xs font-serif italic text-pink-800 tracking-tight select-none max-w-[140px] truncate"
                title="sing to your heart ~ nine vicious"
              >
                sing to your heart
              </span>

              {/* Mute / Unmute Button */}
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="text-pink-400 hover:text-pink-600 transition-colors p-1 rounded-full cursor-pointer flex-shrink-0 active:scale-95"
                aria-label={isMuted ? 'Unmute music' : 'Mute music'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-pink-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-pink-600" />
                )}
              </button>

              {/* Hide / Collapse Button (shrinks back to music icon) */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                title="Hide player (shows music icon)"
                aria-label="Hide music controls"
                className="text-pink-400 hover:text-pink-700 hover:bg-pink-50 transition-colors p-1 rounded-full cursor-pointer flex-shrink-0 active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
