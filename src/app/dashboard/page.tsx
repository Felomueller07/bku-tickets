'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Ticket, ChevronDown, Gift, Plus, Copy, Check } from 'lucide-react';
import SeatMap from '@/components/SeatMap';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showFreeTickets, setShowFreeTickets] = useState(false);
  const [freeTickets, setFreeTickets] = useState<any[]>([]);
  const [freeTicketsLoading, setFreeTicketsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const loadFreeTickets = async () => {
    setFreeTicketsLoading(true);
    try {
      const res = await fetch('/api/admin/free-tickets');
      const data = await res.json();
      setFreeTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFreeTicketsLoading(false);
    }
  };

  const toggleFreeTickets = () => {
    if (!showFreeTickets) loadFreeTickets();
    setShowFreeTickets(!showFreeTickets);
  };

  const generateTicket = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/free-tickets', { method: 'POST' });
      const ticket = await res.json();
      setFreeTickets(prev => [ticket, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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

            {/* EVENT INFO BANNER */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '1.5rem',
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.03) 100%)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '12px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.25rem',
                }}>
                  Datum & Uhrzeit
                </div>
                <div style={{ color: 'white', fontSize: '1rem', fontWeight: '600' }}>
                  Samstag, 22. März 2026
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                  19:00 Uhr
                </div>
              </div>

              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />

              <div style={{ flex: 1 }}>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.25rem',
                }}>
                  Veranstaltungsort
                </div>
                <div style={{ color: 'white', fontSize: '1rem', fontWeight: '600' }}>
                  Kursaal Meran
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                  Südtirol
                </div>
              </div>

              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />

              <div style={{ flex: 1 }}>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.25rem',
                }}>
                  Ticketpreis
                </div>
                <div style={{ 
                  color: '#d4af37', 
                  fontSize: '1.5rem', 
                  fontWeight: '800',
                  lineHeight: 1,
                }}>
                  20,00 €
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                  pro Ticket
                </div>
              </div>
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

            {/* FREIKARTEN PANEL - nur für Admins */}
            {isAdmin && (
              <div style={{
                marginTop: '1.5rem',
                marginBottom: isMobile ? '2rem' : '2rem',
                padding: isMobile ? '0 1rem' : '0',
              }}>
                <button
                  onClick={toggleFreeTickets}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: showFreeTickets ? '0.875rem 0.875rem 0 0' : '0.875rem',
                    cursor: 'pointer',
                    color: '#d4af37',
                    fontSize: isMobile ? '0.9375rem' : '1rem',
                    fontWeight: '600',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Gift size={isMobile ? 18 : 20} />
                    Freikarten verwalten
                    {freeTickets.length > 0 && (
                      <span style={{
                        background: 'rgba(212, 175, 55, 0.2)',
                        borderRadius: '9999px',
                        padding: '0.15rem 0.625rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                      }}>
                        {freeTickets.filter(t => !t.used).length} verfügbar
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    size={20}
                    style={{
                      transition: 'transform 0.2s',
                      transform: showFreeTickets ? 'rotate(180deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}
                  />
                </button>

                <AnimatePresence>
                  {showFreeTickets && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderTop: 'none',
                        borderRadius: '0 0 0.875rem 0.875rem',
                        padding: isMobile ? '1.25rem' : '1.5rem',
                      }}>
                        {/* Summary row on mobile */}
                        {isMobile && freeTickets.length > 0 && (
                          <div style={{
                            display: 'flex',
                            gap: '0.625rem',
                            marginBottom: '1.25rem',
                          }}>
                            <div style={{
                              flex: 1,
                              background: 'rgba(74,222,128,0.08)',
                              border: '1px solid rgba(74,222,128,0.25)',
                              borderRadius: '0.75rem',
                              padding: '0.75rem',
                              textAlign: 'center',
                            }}>
                              <div style={{ color: '#4ade80', fontSize: '1.375rem', fontWeight: '800' }}>
                                {freeTickets.filter(t => !t.used).length}
                              </div>
                              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6875rem', marginTop: '0.25rem' }}>Verfügbar</div>
                            </div>
                            <div style={{
                              flex: 1,
                              background: 'rgba(239,68,68,0.08)',
                              border: '1px solid rgba(239,68,68,0.25)',
                              borderRadius: '0.75rem',
                              padding: '0.75rem',
                              textAlign: 'center',
                            }}>
                              <div style={{ color: '#ef4444', fontSize: '1.375rem', fontWeight: '800' }}>
                                {freeTickets.filter(t => t.used).length}
                              </div>
                              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6875rem', marginTop: '0.25rem' }}>Verwendet</div>
                            </div>
                            <div style={{
                              flex: 1,
                              background: 'rgba(212,175,55,0.08)',
                              border: '1px solid rgba(212,175,55,0.25)',
                              borderRadius: '0.75rem',
                              padding: '0.75rem',
                              textAlign: 'center',
                            }}>
                              <div style={{ color: '#d4af37', fontSize: '1.375rem', fontWeight: '800' }}>
                                {freeTickets.length}
                              </div>
                              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6875rem', marginTop: '0.25rem' }}>Gesamt</div>
                            </div>
                          </div>
                        )}

                        {/* Neue Freikarte generieren */}
                        <button
                          onClick={generateTicket}
                          disabled={generating}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            width: isMobile ? '100%' : 'auto',
                            padding: isMobile ? '0.875rem 1.25rem' : '0.625rem 1.25rem',
                            background: generating ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
                            border: 'none',
                            borderRadius: '0.625rem',
                            color: '#1a1a1a',
                            fontWeight: '700',
                            fontSize: isMobile ? '0.9375rem' : '0.875rem',
                            cursor: generating ? 'not-allowed' : 'pointer',
                            marginBottom: '1rem',
                          }}
                        >
                          <Plus size={16} />
                          {generating ? 'Wird generiert...' : 'Neue Freikarte generieren'}
                        </button>

                        {/* Liste */}
                        {freeTicketsLoading ? (
                          <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '1.5rem' }}>
                            Lädt...
                          </div>
                        ) : freeTickets.length === 0 ? (
                          <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '1.5rem', fontSize: '0.875rem' }}>
                            Noch keine Freikarten vorhanden.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {freeTickets.map((ticket) => (
                              <div
                                key={ticket.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                                  background: ticket.used
                                    ? 'rgba(239, 68, 68, 0.06)'
                                    : 'rgba(74, 222, 128, 0.06)',
                                  border: `1px solid ${ticket.used ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'}`,
                                  borderRadius: '0.625rem',
                                  gap: '0.75rem',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
                                  <span style={{
                                    fontFamily: 'monospace',
                                    fontSize: isMobile ? '1rem' : '0.95rem',
                                    fontWeight: '600',
                                    color: ticket.used ? 'rgba(255,255,255,0.35)' : 'white',
                                    textDecoration: ticket.used ? 'line-through' : 'none',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}>
                                    {ticket.code}
                                  </span>
                                  {!ticket.used && (
                                    <button
                                      onClick={() => copyCode(ticket.code)}
                                      title="Code kopieren"
                                      style={{
                                        background: copiedCode === ticket.code ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)',
                                        border: `1px solid ${copiedCode === ticket.code ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.15)'}`,
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        color: copiedCode === ticket.code ? '#4ade80' : 'rgba(255,255,255,0.5)',
                                        padding: isMobile ? '0.375rem 0.5rem' : '0.25rem 0.375rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                        transition: 'all 0.15s',
                                      }}
                                    >
                                      {copiedCode === ticket.code ? <Check size={isMobile ? 16 : 15} /> : <Copy size={isMobile ? 16 : 15} />}
                                    </button>
                                  )}
                                </div>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  padding: '0.25rem 0.625rem',
                                  borderRadius: '9999px',
                                  background: ticket.used ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)',
                                  color: ticket.used ? '#ef4444' : '#4ade80',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}>
                                  {ticket.used
                                    ? (isMobile
                                        ? (ticket.usedAt ? new Date(ticket.usedAt).toLocaleDateString('de-DE') : 'Verwendet')
                                        : `Verwendet ${ticket.usedAt ? new Date(ticket.usedAt).toLocaleDateString('de-DE') : ''}`)
                                    : 'Verfügbar'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}