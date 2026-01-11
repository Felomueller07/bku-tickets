'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Ticket } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetch('/api/payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLoading(false);
          } else {
            setError('Fehler bei der Bestätigung');
            setLoading(false);
          }
        })
        .catch((err) => {
          setError('Fehler bei der Bestätigung');
          setLoading(false);
        });
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Zahlung wird bestätigt...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '1.5rem',
          padding: '3rem',
          maxWidth: '500px',
          width: '100%',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          textAlign: 'center',
        }}>
          <div style={{ color: '#ef4444', fontSize: '4rem', marginBottom: '1rem' }}>✗</div>
          <h1 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1rem' }}>
            Fehler
          </h1>
          <p style={{ color: '#fff', marginBottom: '2rem' }}>{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#000',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

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
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '3rem',
          maxWidth: '600px',
          width: '100%',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
          }}
        >
          <CheckCircle style={{ width: '60px', height: '60px', color: '#fff' }} />
        </motion.div>

        <h1 style={{
          color: '#d4af37',
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '1rem',
        }}>
          Zahlung erfolgreich!
        </h1>

        <p style={{
          color: '#fff',
          fontSize: '1.125rem',
          marginBottom: '1rem',
        }}>
          Vielen Dank für Ihre Bestellung!
        </p>

        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.875rem',
          marginBottom: '2rem',
        }}>
          Sie erhalten in Kürze eine Bestätigungs-Email mit Ihren Tickets.
        </p>

        <div style={{
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <Ticket style={{ width: '40px', height: '40px', color: '#d4af37', margin: '0 auto 1rem' }} />
          <p style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '600' }}>
            Ihre Tickets wurden reserviert!
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Josefi Konzert 2026<br />
            22. März 2026 · 19:00 Uhr<br />
            Kursaal Meran
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/meine-tickets')}
            style={{
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#000',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Ticket size={20} />
            Meine Tickets
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Home size={20} />
            Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Lädt...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
