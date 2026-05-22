import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Set up motion values for cursor tracking
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Add buttery-smooth spring physics for fluid movement
  const springConfig = { damping: 30, stiffness: 200, mass: 0.6 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Detect mobile / touch-only devices to avoid sticky circles on tap
    const touchQuery = window.matchMedia('(pointer: coarse)');
    setIsTouchDevice(touchQuery.matches);

    const handleTouchChange = (e) => {
      setIsTouchDevice(e.matches);
    };

    if (touchQuery.addEventListener) {
      touchQuery.addEventListener('change', handleTouchChange);
    }

    // Handles initial move to fade-in the glow instantly
    const handleMouseMove = (e) => {
      if (touchQuery.matches) return;

      // Update motion values
      mouseX.set(e.clientX - 175); // Centers the 350px viewport glow
      mouseY.set(e.clientY - 175);

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (touchQuery.removeEventListener) {
        touchQuery.removeEventListener('change', handleTouchChange);
      }
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[9999] mix-blend-screen"
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <motion.div
        style={{
          x: glowX,
          y: glowY,
          width: 350,
          height: 350,
        }}
        className="absolute rounded-full bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.25)_0%,rgba(16,185,129,0.12)_45%,rgba(13,148,136,0.02)_75%,transparent_100%)] blur-md"
      />
    </motion.div>
  );
}
