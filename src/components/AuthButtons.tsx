'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';

export default function AuthButtons() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {/* Login Button */}
      <motion.button
        onClick={() => router.push('/auth/login')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <LogIn style={{ width: '18px', height: '18px' }} />
        <span>Anmelden</span>
      </motion.button>

      {/* Register Button */}
      <motion.button
        onClick={() => router.push('/auth/register')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
          border: 'none',
          borderRadius: '0.75rem',
          color: '#000',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
        }}
      >
        <UserPlus style={{ width: '18px', height: '18px' }} />
        <span>Registrieren</span>
      </motion.button>
    </div>
  );
}