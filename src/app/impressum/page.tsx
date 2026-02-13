'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImpressumPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#d4af37',
            fontSize: '0.875rem',
            cursor: 'pointer',
            marginBottom: '2rem',
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Zurück
        </button>

        <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '2rem' }}>
          Impressum
        </h1>

        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '2rem',
          borderRadius: '1rem',
          color: 'white',
        }}>
          <h2 style={{ color: '#d4af37', marginBottom: '1rem' }}>
            Bürgerkapelle Untermais (BKU)
          </h2>
          <p>Weitere Details werden von der BKU ergänzt.</p>
        </div>
      </div>
    </div>
  );
}
