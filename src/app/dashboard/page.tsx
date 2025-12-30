'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import SeatMap from '@/components/SeatMap';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Lädt...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdmin = (session.user as any)?.role === 'admin';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    }}>
      {/* HEADER */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem',
      }}>
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
            }}>
              Josefi Konzert 2026
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
              margin: 0,
            }}>
              {isAdmin ? 'Admin Dashboard' : 'Ticketverkauf'}
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '0.5rem',
            }}>
              <User style={{ width: '16px', height: '16px', color: '#d4af37' }} />
              <span style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '500' }}>
                {session.user?.name || session.user?.email}
              </span>
              {isAdmin && (
                <span style={{
                  padding: '0.125rem 0.5rem',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#a78bfa',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: '0.25rem',
                  marginLeft: '0.5rem',
                }}>
                  ADMIN
                </span>
              )}
            </div>

            <motion.button
              onClick={() => signOut({ callbackUrl: '/' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.5rem',
                color: '#ef4444',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
              Abmelden
            </motion.button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{
              color: 'white',
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}>
              {isAdmin ? 'Admin Dashboard' : 'Sitzplatzauswahl'}
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1.125rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}>
              Kursaal Meran
            </p>

            <SeatMap />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
