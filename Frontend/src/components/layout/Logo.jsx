import { motion } from 'motion/react';

export function Logo({ size = 'sm', showText = true, className = '' }) {
  // Dimension mappings
  const sizes = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', subtext: 'text-[7px]' },
    sm: { icon: 'w-10 h-10', text: 'text-lg', subtext: 'text-[9px]' },
    md: { icon: 'w-16 h-16', text: 'text-2xl', subtext: 'text-xs' },
    lg: { icon: 'w-36 h-36', text: 'text-5xl', subtext: 'text-lg' },
  };

  const currentSize = sizes[size] || sizes.sm;

  return (
    <div className={`inline-flex ${size === 'lg' ? 'flex-col' : 'flex-row'} items-center gap-3 ${className}`}>
      {/* Animated Shield + Heartbeat Logo */}
      <motion.div
        className={`${currentSize.icon} relative flex items-center justify-center`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue Shield Base */}
          <motion.path
            d="M 50 15 C 65 17, 78 20, 78 35 Q 78 70, 50 85 Q 22 70, 22 35 C 22 20, 35 17, 50 15 Z"
            fill="#2ea0e4"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* White Cross */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
            style={{ originX: '50px', originY: '50px' }}
          >
            {/* Horizontal Cross Arm */}
            <rect x="28" y="42" width="44" height="16" rx="5" fill="#ffffff" />
            {/* Vertical Cross Arm */}
            <rect x="42" y="28" width="16" height="44" rx="5" fill="#ffffff" />
          </motion.g>

          {/* Beating Heart (Framer heartbeat scale effect - colored red) */}
          <motion.path
            d="M 50 56.5 C 50 56.5, 43 51, 43 47.5 C 43 44.5, 45.4 42, 48.5 42 C 50 42, 50 43.5, 50 43.5 C 50 43.5, 50 42, 51.5 42 C 54.6 42, 57 44.5, 57 47.5 C 57 51, 50 56.5, 50 56.5 Z"
            fill="#ef4444"
            animate={{
              scale: [1, 1.15, 1, 1.18, 1, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.1, 0.2, 0.3, 0.45, 1],
            }}
            style={{ originX: '50px', originY: '50px' }}
          />
        </svg>
      </motion.div>

      {/* Branded Label text matching the primary theme green */}
      {showText && (
        <div className={`flex flex-col ${size === 'lg' ? 'items-center text-center mt-4' : 'text-left'}`}>
          <motion.span
            className={`${currentSize.text} font-display font-extrabold tracking-[0.08em] text-brand-primary uppercase leading-none`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            FindMeds
          </motion.span>
          <motion.span
            className={`${currentSize.subtext} tracking-[0.3em] font-sans font-semibold text-brand-primary uppercase mt-0.5`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            Since 2026
          </motion.span>
        </div>
      )}
    </div>
  );
}
