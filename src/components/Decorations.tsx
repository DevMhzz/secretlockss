import React, { useEffect, useState } from 'react';

export const Decorations: React.FC = () => {
  const [floatingIcons, setFloatingIcons] = useState<Array<{ id: number; left: number; delay: number; size: number; icon: string }>>([]);

  useEffect(() => {
    // Gentle floating kawaii icons in the pink background
    const icons = ['🌸', '✨', '🎀', '💕', '🍓', '🧁'];
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.floor(Math.random() * 95),
      delay: Math.random() * 6,
      size: 14 + Math.floor(Math.random() * 16),
      icon: icons[i % icons.length],
    }));
    setFloatingIcons(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {floatingIcons.map((item) => (
        <div
          key={item.id}
          className="absolute opacity-35 animate-float"
          style={{
            left: `${item.left}%`,
            top: `${(item.id * 8) % 90}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${5 + (item.id % 4)}s`,
            fontSize: `${item.size}px`,
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};
