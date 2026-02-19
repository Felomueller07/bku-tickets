'use client';

import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface MobileCheckoutButtonProps {
  selectedCount: number;
  onClick: () => void;
}

export default function MobileCheckoutButton({
  selectedCount,
  onClick,
}: MobileCheckoutButtonProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 150,
        background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
        border: 'none',
        borderRadius: '50px',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
      }}
    >
      {/* Einkaufswagen Icon mit Badge */}
      <div style={{ position: 'relative' }}>
        <ShoppingCart style={{ width: '24px', height: '24px', color: '#0a0a0a' }} />
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          background: '#ef4444',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: '700',
          color: 'white',
          border: '2px solid #0a0a0a',
        }}>
          {selectedCount}
        </div>
      </div>

      {/* Text */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '2px',
      }}>
        <span style={{
          color: '#0a0a0a',
          fontSize: '14px',
          fontWeight: '700',
          lineHeight: '1',
        }}>
          {selectedCount} {selectedCount === 1 ? 'Sitz' : 'Sitze'}
        </span>
        <span style={{
          color: 'rgba(10, 10, 10, 0.7)',
          fontSize: '12px',
          fontWeight: '600',
          lineHeight: '1',
        }}>
          Zum Checkout →
        </span>
      </div>
    </motion.button>
  );
} 