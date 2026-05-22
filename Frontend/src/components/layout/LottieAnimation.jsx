import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Shield, Paperclip, Heart, AlertCircle, Award } from 'lucide-react';

export function LottieAnimation({ className = '' }) {
  // Add direct responsive mouse parallax effect for premium feel
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const dX = useSpring(mouseX, springConfig);
  const dY = useSpring(mouseY, springConfig);

  // Parallax transforms for layers
  const bgTranslateX = useTransform(dX, [-500, 500], [-15, 15]);
  const bgTranslateY = useTransform(dY, [-500, 500], [-15, 15]);
  const midTranslateX = useTransform(dX, [-500, 500], [-25, 25]);
  const midTranslateY = useTransform(dY, [-500, 500], [-25, 25]);
  const frontTranslateX = useTransform(dX, [-500, 500], [-45, 45]);
  const frontTranslateY = useTransform(dY, [-500, 500], [-45, 45]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center min-h-[460px] lg:min-h-[500px] w-full bg-linear-to-b from-slate-50 to-teal-50/20 rounded-[2.5rem] border border-slate-100 p-8 overflow-hidden group select-none ${className}`}
    >
      {/* Absolute Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d94880a_1px,transparent_1px),linear-gradient(to_bottom,#0d94880a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80" />

      {/* Floating Sparkles & Soft Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft cyan glow spot */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />

        {/* Pulse indicators mimicking user's Medical Outlines */}
        <motion.div 
          className="absolute top-16 right-20 w-3 h-3 bg-red-400 rounded-full"
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-24 left-16 w-4 h-4 bg-teal-300 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-36 left-28 w-2 h-2 bg-yellow-400 rounded-full"
          animate={{ scale: [1, 2, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      {/* Main Composite Vector Stage with Parallax Layers */}
      <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
        
        {/* LAYER 1: BACKGROUND GLOWING RINGS & HEARTRATE WAVE */}
        <motion.div 
          style={{ x: bgTranslateX, y: bgTranslateY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* Wave ring 1 */}
          <motion.div 
            className="absolute w-72 h-72 rounded-full bg-teal-500/5 border border-teal-500/10"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Wave ring 2 */}
          <motion.div 
            className="absolute w-96 h-96 rounded-full bg-blue-500/5 border border-blue-500/10"
            animate={{ scale: [0.95, 1.15, 0.95], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* Interactive Heart Rate ECG Vector */}
          <svg viewBox="0 0 300 100" className="w-[320px] h-20 opacity-20 text-teal-600">
            <motion.path
              d="M 10 50 L 70 50 L 85 20 L 95 80 L 110 50 L 130 50 L 140 40 L 148 60 L 155 50 L 220 50"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1], pathOffset: [0, 0, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>

        {/* LAYER 2: MIDGROUND - PRESCRIPTION PAPER & MEDICINE BOTTLE */}
        <motion.div 
          style={{ x: midTranslateX, y: midTranslateY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* MEDICINE BOTTLE (Floating Bottom Left) */}
          <motion.div
            className="absolute bottom-6 left-6 w-24 h-36 bg-white/95 rounded-2xl border-2 border-slate-100 shadow-xl p-4 flex flex-col items-center justify-between"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Cap */}
            <div className="w-12 h-4 bg-teal-500 rounded-lg -mt-6 border-b border-teal-600 shadow-xs" />
            
            {/* Label */}
            <div className="w-full h-1/2 bg-teal-50/50 rounded-lg border border-teal-100 flex flex-col items-center justify-center p-1 space-y-1.5 mt-2">
              {/* Prescription cross symbol */}
              <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-0.5 bg-white rounded-full absolute" />
                <div className="w-0.5 h-2.5 bg-white rounded-full absolute" />
              </div>
              <div className="w-10 h-1 bg-slate-350 rounded-full" />
              <div className="w-8 h-1 bg-slate-350 rounded-full" />
            </div>

            {/* Liquid safe lines */}
            <div className="w-full flex justify-between px-1 mt-1 opacity-40">
              <div className="w-5 h-0.5 bg-teal-400" />
              <div className="w-3 h-0.5 bg-teal-400" />
            </div>
          </motion.div>

          {/* PRESCRIPTION PAPER (Floating Top Right) */}
          <motion.div
            className="absolute top-6 right-6 w-28 h-36 bg-white rounded-[1.25rem] border-2 border-slate-100 shadow-2xl p-4 flex flex-col space-y-2.5"
            animate={{ y: [0, 8, 0], rotate: [2, -2, 2] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Paper Header check indicators */}
            <div className="flex justify-between items-center">
              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
              <div className="w-12 h-2 bg-slate-200 rounded-full" />
            </div>
            
            <div className="space-y-1.5">
              <div className="w-full h-1.5 bg-slate-100 rounded-full" />
              <div className="w-4/5 h-1.5 bg-slate-100 rounded-full" />
              <div className="w-full h-1.5 bg-slate-100 rounded-full" />
              <div className="w-2/3 h-1.5 bg-slate-100 rounded-full" />
            </div>

            {/* Stamp signature */}
            <div className="self-end pt-1">
              <div className="w-6 h-6 border-2 border-amber-300 rounded-full flex items-center justify-center opacity-60">
                <Award className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* LAYER 3: FOREGROUND - MAIN PROTECTIVE SHIELD & STETHOSCOPE */}
        <motion.div 
          style={{ x: frontTranslateX, y: frontTranslateY }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* STETHOSCOPE HOOP ASSEMBLY */}
          <motion.div 
            className="absolute inset-8 flex items-center justify-center pointer-events-none"
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Curved realistic stethoscope tubular path */}
            <svg viewBox="0 0 100 100" className="w-[110%] h-[110%] absolute stroke-slate-300/85 fill-transparent" style={{ strokeWidth: "3.5", strokeLinecap: "round" }}>
              {/* Outer Loop wrapping elements */}
              <path d="M 12,50 C 10,85 90,85 88,50" />
              {/* Binaural spring pieces */}
              <path d="M 12,50 L 15,35 M 88,50 L 85,35" strokeWidth="2.5" />
            </svg>

            {/* Stethoscope Chestpiece / Diaphragm (Interactive floating disc) */}
            <motion.div 
              className="absolute bottom-1 right-20 w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-400 border border-slate-50 px-2 flex items-center justify-center rounded-full shadow-2xl z-20 cursor-pointer"
              whileHover={{ scale: 1.12 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-11 h-11 bg-slate-100 rounded-full border border-slate-300 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <div className="w-4 h-4 bg-teal-500 rounded-full opacity-60" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* MAIN PROTECTIVE HEALTHCARE SHIELD HERO */}
          <motion.div 
            className="relative w-48 h-48 flex items-center justify-center cursor-pointer z-10"
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Interactive Pulse Halo rings around shield */}
            <motion.div 
              className="absolute inset-[-12px] rounded-full border border-teal-400/20"
              animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Glowing Shadow base */}
            <div className="absolute inset-4 rounded-full bg-teal-500/20 shadow-[0_0_50px_15px_rgba(13,148,136,0.25)] blur-md pointer-events-none" />

            {/* Shield SVG Model matching MEDICINE shape outlines */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_15px_30px_rgba(13,148,136,0.15)] filter">
              {/* Outer Blue/Teal Shield Frame */}
              <path
                d="M 50 10 C 68 13, 84 17, 84 37 Q 84 75, 50 90 Q 16 75, 16 37 C 16 17, 32 13, 50 10 Z"
                fill="#ffffff"
                stroke="#0d9488"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              
              {/* Inner Shield Contrast Layer */}
              <path
                d="M 50 14 C 64 17, 78 20, 78 37 Q 78 71, 50 84 Q 22 71, 22 37 C 22 20, 36 17, 50 14 Z"
                fill="url(#shieldGrad)"
              />

              {/* Glowing Interactive Heart Centerpiece inside the Shield */}
              <g transform="translate(0, 3)" className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                {/* Embedded dynamic heart cross */}
                <path
                  d="M 50 63 C 50 63, 35 52, 35 44 C 35 37, 40 33, 46 33 C 50 33, 50 36, 50 36 C 50 36, 50 33, 54 33 C 60 33, 65 37, 65 44 C 65 52, 50 63, 50 63 Z"
                  fill="#ffffff"
                />
                
                {/* Red cross inset */}
                <path
                  d="M 47 41 L 53 41 M 50 38 L 50 44"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Linear Gradient for Shield */}
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="10%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#0f766e" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* P3K / MEDICINE BOX (Floating Bottom Right) */}
          <motion.div
            className="absolute bottom-0 right-4 w-28 h-24 bg-rose-50 border-2 border-rose-100 rounded-2xl shadow-xl p-3 flex flex-col justify-between"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            {/* White strap */}
            <div className="w-12 h-3 bg-white border border-rose-100 rounded-md absolute -top-1.5 left-1/2 -translate-x-1/2" />
            
            {/* Inset content */}
            <div className="flex justify-between items-center mt-1">
              <div className="w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white fill-white" />
              </div>
              <div className="w-8 h-1.5 bg-rose-200 rounded-full" />
            </div>

            {/* Large Medical Cross */}
            <div className="w-full flex items-center justify-center gap-1.5 py-1 bg-white rounded-lg border border-rose-100 mt-2">
              <div className="w-4 h-4 text-rose-500 flex items-center justify-center relative">
                <div className="w-3.5 h-1 bg-rose-500 rounded-full absolute" />
                <div className="w-1 h-3.5 bg-rose-500 rounded-full absolute" />
              </div>
              <span className="text-[10px] font-bold text-rose-600 font-mono tracking-widest uppercase">Safe</span>
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Embedded Actionable Hover Tag overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xs shadow-md border border-slate-100/50 rounded-full py-1.5 px-4 flex items-center gap-2 pointer-events-none group-hover:scale-105 transition-transform duration-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
        </span>
        <span className="text-[10px] font-bold font-mono tracking-widest text-slate-800 uppercase">Interactive Network Live</span>
      </div>
    </div>
  );
}

