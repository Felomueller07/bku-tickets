'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function AuthErrorPage() {
  const router = useRouter();

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          maxWidth: '500px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle style={{ width: '40px', height: '40px', color: '#ef4444' }} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '1rem' }}>
          Authentifizierungsfehler
        </h1>

        <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2rem' }}>
          Es ist ein Fehler bei der Anmeldung aufgetreten.
        </p>

        <motion.button
          onClick={() => router.push('/auth/login')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '0.875rem 2rem',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
            color: '#000',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Zurück zur Anmeldung
        </motion.button>
      </motion.div>
    </div>
  );
}