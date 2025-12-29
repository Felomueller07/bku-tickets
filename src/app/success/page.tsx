'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Home } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('session_id');
  const [countdown, setCountdown] = useState(5);
  const [message, setMessage] = useState('🔄 Sitze werden aktualisiert...');

  useEffect(() => {
    const updateSeats = async () => {
      if (!sessionId) return;
      
      try {
        const response = await fetch(`/api/payment-success?session_id=${sessionId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setMessage('✅ Sitze erfolgreich gebucht!');
        } else {
          setMessage('⚠️ Fehler: ' + (data.error || 'Unbekannter Fehler'));
        }
      } catch (error) {
        setMessage('❌ Fehler beim Aktualisieren');
      }
    };

    updateSeats();
  }, [sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      // WICHTIG: router.push mit refresh!
      router.push('/dashboard');
      router.refresh();
    }
  }, [countdown, router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', maxWidth: '500px' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(74, 222, 128, 0.4)',
          }}
        >
          <CheckCircle style={{ width: '60px', height: '60px', color: '#fff' }} />
        </motion.div>

        <h1 style={{ color: '#4ade80', fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
          Zahlung erfolgreich!
        </h1>

        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
          Vielen Dank für deine Bestellung!
        </p>

        <div style={{
          padding: '1.5rem',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '1rem',
          marginBottom: '2rem',
        }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', margin: 0 }}>
            {message}
          </p>
        </div>

        <motion.button
          onClick={() => {
            router.push('/dashboard');
            router.refresh();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
            color: '#000',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Home style={{ width: '18px', height: '18px' }} />
          Zurück zum Dashboard
        </motion.button>

        <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.875rem', marginTop: '2rem' }}>
          Weiterleitung in {countdown} Sekunden...
        </p>
      </motion.div>
    </div>
  );
}
