'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Ticket, ChevronDown } from 'lucide-react';
import SeatMap from '@/components/SeatMap';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile Detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    }}>
      {/* DESKTOP HEADER - NUR für eingeloggte User auf Desktop! */}
      {!isMobile && session && (
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
              {/* USER DROPDOWN */}
              <div style={{ position: 'relative' }}>
                <motion.button
                  onClick={() => setShowDropdown(!showDropdown)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
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
                  {!isAdmin && (
                    <ChevronDown 
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        color: '#d4af37',
                        transition: 'transform 0.2s',
                        transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      }} 
                    />
                  )}
                </motion.button>

                {/* DROPDOWN - NUR FÜR NORMALE USER */}
                {!isAdmin && (
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 0.5rem)',
                          right: 0,
                          minWidth: '200px',
                          backgroundColor: 'rgba(0, 0, 0, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                          zIndex: 50,
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        <motion.button
                          onClick={() => {
                            setShowDropdown(false);
                            router.push('/meine-tickets');
                          }}
                          whileHover={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0.375rem',
                            color: '#d4af37',
                            fontSize: '0.875rem',
                            fontWeight: '400',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <Ticket style={{ width: '16px', height: '16px' }} />
                          Meine Tickets
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {/* LOGOUT */}
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
      )}

      {/* CONTENT */}
      <div style={{ padding: isMobile ? '0' : '2rem' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* TITEL - NUR auf Desktop! */}
            {!isMobile && (
              <>
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
              </>
            )}

            <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Lade Sitzplan...</div>}>
              <SeatMap />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </div>
  );
}