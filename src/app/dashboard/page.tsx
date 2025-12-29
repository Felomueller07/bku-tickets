'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SeatMap from '@/components/SeatMap';
import AuthButtons from '@/components/AuthButtons';
import UserMenu from '@/components/UserMenu';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is admin
  const isAdmin = session?.user && (session.user as any).role === 'admin';
  const userId = session?.user ? parseInt((session.user as any).id || '0') : 0;

  return (
    <div 
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflow: 'auto',
        backgroundColor: '#5a4a42',
      }}
    >
      {/* Gradient Overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(107, 90, 80, 0.5) 0%, transparent 50%, rgba(74, 58, 50, 0.5) 100%)',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* TOP BAR: Back Button + Auth */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => router.push('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255, 255, 255, 0.8)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(255, 255, 255)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
            >
              <ArrowLeft style={{ width: '20px', height: '20px' }} />
              <span>Zurück</span>
            </button>
          </motion.div>

          {/* Auth Buttons / User Menu */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {status === 'loading' ? (
              <div style={{ color: 'white' }}>Lädt...</div>
            ) : session ? (
              <UserMenu />
            ) : (
              <AuthButtons />
            )}
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: '2rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem',
          }}>
            {isAdmin ? 'Admin Dashboard' : 'Sitzplatzauswahl'}
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            {isAdmin ? 'Verwaltung & Reservierungen' : 'Wähle deine Sitzplätze'}
          </p>
        </motion.div>

        {/* Sitzplan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {status === 'loading' ? (
            <div style={{ textAlign: 'center', color: 'white', padding: '4rem' }}>
              Lädt Sitzplan...
            </div>
          ) : (
            <SeatMap isAdmin={isAdmin || false} userId={userId} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
