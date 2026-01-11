'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Download, ArrowLeft } from 'lucide-react';

interface TicketData {
  id: number;
  row: string;
  number: number;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
}

export default function MeineTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status, router]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/seats');
      const allSeats = await response.json();

      const userId = (session?.user as any)?.id;
      const myTickets = allSeats.filter((seat: any) =>
        seat.userId === parseInt(userId) && seat.status === 'paid'
      );

      setTickets(myTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
      }}>
        Lädt...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            display: block !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .ticket-print {
            width: 18cm !important;
            max-width: 18cm !important;
            margin: 2cm auto 0 auto !important;
            background: white !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
          }
          
          .ticket-print:last-child {
            page-break-after: auto !important;
          }
          
          .ticket-header-print {
            background: #e0e0e0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .ticket-body-print {
            background: white !important;
            border-top: 2px solid #000 !important;
            border-bottom: 2px solid #000 !important;
          }
          
          .ticket-footer-print {
            background: #e0e0e0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print-button {
            display: none !important;
          }
        }
        
        @page {
          size: A4 portrait;
          margin: 1.5cm 1cm 1cm 1cm;
        }
      `}</style>

      <div className="no-print" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: '2rem 1rem',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: '#D4A017',
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginBottom: '2rem',
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Zurück zum Dashboard
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Ticket style={{ width: '40px', height: '40px', color: '#D4A017' }} />
              <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: '700', margin: 0 }}>
                Meine Tickets
              </h1>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.125rem', margin: 0 }}>
              {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'} für das Josefi Konzert 2026
            </p>
          </motion.div>

          {tickets.length > 0 && (
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #D4A017 0%, #C9A961 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#000',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '2rem',
              }}
            >
              <Download style={{ width: '20px', height: '20px' }} />
              Alle Tickets drucken
            </button>
          )}

          {tickets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '1.5rem',
                padding: '3rem',
                textAlign: 'center',
              }}
            >
              <Ticket style={{ width: '64px', height: '64px', color: 'rgba(255, 255, 255, 0.3)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.125rem' }}>
                Du hast noch keine Tickets gekauft.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #D4A017 0%, #C9A961 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#000',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Jetzt Tickets kaufen
              </button>
            </motion.div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
              gap: '1.5rem',
            }}>
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{
                    backgroundColor: '#4A4A4A',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div style={{
                    background: '#4A4A4A',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <img
                      src="/bku-logo.png"
                      alt="BKU Logo"
                      style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'contain',
                        flexShrink: 0,
                        borderRadius: '8px',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
                        BÜRGERKAPELLE UNTERMAIS
                      </h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', margin: 0 }}>
                        Josefi Konzert 2026
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    backgroundColor: '#D4A017',
                    padding: '1.5rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '1rem',
                    }}>
                      <div>
                        <div style={{ marginBottom: '1.25rem' }}>
                          <p style={{ 
                            color: '#4A4A4A', 
                            fontSize: '0.625rem', 
                            fontWeight: '700', 
                            margin: '0 0 0.25rem 0',
                            letterSpacing: '1px'
                          }}>
                            VERANSTALTUNG
                          </p>
                          <p style={{ 
                            color: '#000', 
                            fontSize: '1rem', 
                            fontWeight: '700', 
                            margin: '0 0 0.125rem 0'
                          }}>
                            22. März 2026 · 19:00 Uhr
                          </p>
                          <p style={{ 
                            color: '#000', 
                            fontSize: '0.875rem', 
                            margin: 0
                          }}>
                            Kursaal Meran
                          </p>
                        </div>

                        <div>
                          <p style={{ 
                            color: '#4A4A4A', 
                            fontSize: '0.625rem', 
                            fontWeight: '700', 
                            margin: '0 0 0.25rem 0',
                            letterSpacing: '1px'
                          }}>
                            SITZPLATZ
                          </p>
                          <p style={{ 
                            color: '#000', 
                            fontSize: '1.5rem', 
                            fontWeight: '700', 
                            margin: '0 0 0.25rem 0'
                          }}>
                            Reihe {ticket.row}, Platz {ticket.number}
                          </p>
                          <p style={{ 
                            color: '#4A4A4A', 
                            fontSize: '0.75rem', 
                            fontWeight: '600', 
                            margin: 0
                          }}>
                            {['BA', 'BB', 'BC', 'BD', 'BM'].includes(ticket.row) ? 'Galerie' : 'Parkett'}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      }}>
                        <QRCodeSVG
                          value={`BKU-2026-${String(ticket.id).padStart(5, '0')}`}
                          size={90}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    </div>

                    <div style={{
                      borderTop: '2px dashed #4A4A4A',
                      margin: '1.25rem 0 1rem 0',
                    }}></div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ 
                          color: '#4A4A4A', 
                          fontSize: '0.625rem', 
                          fontWeight: '700', 
                          margin: '0 0 0.25rem 0',
                          letterSpacing: '1px'
                        }}>
                          TICKET NR.
                        </p>
                        <p style={{ 
                          color: '#000', 
                          fontSize: '0.875rem', 
                          fontWeight: '700', 
                          fontFamily: 'monospace', 
                          margin: 0
                        }}>
                          BKU-2026-{String(ticket.id).padStart(5, '0')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ 
                          color: '#4A4A4A', 
                          fontSize: '0.625rem', 
                          fontWeight: '700', 
                          margin: '0 0 0.25rem 0',
                          letterSpacing: '1px'
                        }}>
                          PREIS
                        </p>
                        <p style={{ 
                          color: '#000', 
                          fontSize: '1.5rem', 
                          fontWeight: '700', 
                          margin: 0
                        }}>
                          20,00 €
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#4A4A4A',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', margin: 0 }}>
                      Bitte ausgedruckt oder digital am Einlass vorzeigen
                    </p>
                    <button
                      onClick={handlePrint}
                      className="print-button"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#D4A017',
                        border: 'none',
                        borderRadius: '0.375rem',
                        color: '#000',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      <Download style={{ width: '14px', height: '14px' }} />
                      Drucken
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DRUCKVERSION */}
      <div className="print-container" style={{ display: 'none' }}>
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-print">
            <div className="ticket-header-print" style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              borderBottom: '2px solid #000',
            }}>
              <img
                src="/bku-logo.png"
                alt="BKU Logo"
                style={{
                  width: '90px',
                  height: '90px',
                  objectFit: 'contain',
                }}
              />
              <div>
                <h3 style={{ color: '#000', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                  BÜRGERKAPELLE UNTERMAIS
                </h3>
                <p style={{ color: '#000', fontSize: '1rem', margin: 0 }}>
                  Josefi Konzert 2026
                </p>
              </div>
            </div>

            <div className="ticket-body-print" style={{ 
              padding: '2rem',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '2rem',
              }}>
                <div>
                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ 
                      color: '#666', 
                      fontSize: '0.75rem', 
                      fontWeight: '700', 
                      margin: '0 0 0.5rem 0',
                      letterSpacing: '1px'
                    }}>
                      VERANSTALTUNG
                    </p>
                    <p style={{ 
                      color: '#000', 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      margin: '0 0 0.25rem 0'
                    }}>
                      22. März 2026 · 19:00 Uhr
                    </p>
                    <p style={{ 
                      color: '#000', 
                      fontSize: '1rem', 
                      margin: 0
                    }}>
                      Kursaal Meran
                    </p>
                  </div>

                  <div>
                    <p style={{ 
                      color: '#666', 
                      fontSize: '0.75rem', 
                      fontWeight: '700', 
                      margin: '0 0 0.5rem 0',
                      letterSpacing: '1px'
                    }}>
                      SITZPLATZ
                    </p>
                    <p style={{ 
                      color: '#000', 
                      fontSize: '2rem', 
                      fontWeight: '700', 
                      margin: '0 0 0.5rem 0'
                    }}>
                      Reihe {ticket.row}, Platz {ticket.number}
                    </p>
                    <p style={{ 
                      color: '#666', 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      margin: 0
                    }}>
                      {['BA', 'BB', 'BC', 'BD', 'BM'].includes(ticket.row) ? 'Galerie' : 'Parkett'}
                    </p>
                  </div>
                </div>

                <div style={{
                  width: '130px',
                  height: '130px',
                  backgroundColor: 'white',
                  border: '2px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                }}>
                  <QRCodeSVG
                    value={`BKU-2026-${String(ticket.id).padStart(5, '0')}`}
                    size={120}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              <div style={{
                borderTop: '2px dashed #000',
                margin: '2rem 0 1.5rem 0',
              }}></div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ 
                    color: '#666', 
                    fontSize: '0.75rem', 
                    fontWeight: '700', 
                    margin: '0 0 0.5rem 0',
                    letterSpacing: '1px'
                  }}>
                    TICKET NR.
                  </p>
                  <p style={{ 
                    color: '#000', 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    fontFamily: 'monospace', 
                    margin: 0
                  }}>
                    BKU-2026-{String(ticket.id).padStart(5, '0')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    color: '#666', 
                    fontSize: '0.75rem', 
                    fontWeight: '700', 
                    margin: '0 0 0.5rem 0',
                    letterSpacing: '1px'
                  }}>
                    PREIS
                  </p>
                  <p style={{ 
                    color: '#000', 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    margin: 0
                  }}>
                    20,00 €
                  </p>
                </div>
              </div>
            </div>

            <div className="ticket-footer-print" style={{
              padding: '1.5rem',
              borderTop: '2px solid #000',
            }}>
              <p style={{ color: '#000', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>
                Bitte ausgedruckt oder digital am Einlass vorzeigen
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
