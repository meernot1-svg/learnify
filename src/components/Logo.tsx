import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <motion.div 
      initial={{ scale: 0.8, rotate: -5 }}
      animate={{ scale: 1, rotate: 0 }}
      className={`relative flex items-center justify-center ${className}`}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full fill-current"
        xmlns="http://www.w3.org/1999/xlink"
      >
        {/* Outline/Shield Shape */}
        <path 
          d="M10 30 L50 10 L90 30 L90 70 L50 90 L10 70 Z" 
          className="fill-black"
        />
        <path 
          d="M15 32 L50 15 L85 32 L85 68 L50 85 L15 68 Z" 
          className="fill-primary"
        />
        
        {/* Three Pillars (Simplified Bats) */}
        <rect x="42" y="25" width="4" height="40" rx="2" className="fill-black" transform="rotate(-15 44 45)" />
        <rect x="48" y="22" width="4" height="45" rx="2" className="fill-black" />
        <rect x="54" y="25" width="4" height="40" rx="2" className="fill-black" transform="rotate(15 56 45)" />
        
        {/* Curved Band (Simplified Turban) */}
        <path 
          d="M30 65 Q50 55 70 65 Q70 75 50 80 Q30 75 30 65" 
          className="fill-black"
        />
        <path 
          d="M35 66 Q50 58 65 66 Q65 72 50 75 Q35 72 35 66" 
          className="fill-primary"
        />
      </svg>
    </motion.div>
  );
};
