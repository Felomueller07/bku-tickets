'use client';

import { motion } from 'framer-motion';

interface ModernTextProps {
  text: string;
}

export default function ModernText({ text }: ModernTextProps) {
  return (
    <motion.h1
      className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white"
      style={{
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.2,
      }}
    >
      {text}
    </motion.h1>
  );
}