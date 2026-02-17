'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, Phone, Ticket, MapPin, Calendar } from 'lucide-react';

interface SeatInfo {
  row: string;
  number: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [seats, setSeats] = useState<SeatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const updateSeats = async () => {
      if (!sessionId) { setLoading(false); return; }
      try {
        const response = await fetch(`/api/payment-success?session_id=${sessionId}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setSeats(data.seats || []);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    updateSeats();
  }, [sessionId]);

  // PDF DOWNLOAD - einfaches Ticket-PDF
  const downloadTicket = (seat: SeatInfo) => {
    const content = `
JOSEFI KONZERT 2026
Bürgerkapelle Untermais

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎫 TICKET

Veranstaltung:  Josefi Konzert 2026
Datum:          15. März 2026
Ort:            Kursaal Meran

Reihe:          ${seat.row}
Platz:          ${seat.number}

Besucher:       ${seat.firstName} ${seat.lastName}
E-Mail:         ${seat.email}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bitte dieses Ticket am Eingang vorzeigen.

Bei Problemen:
📞 +39 0473 123 456
✉️ info@bku.it
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ticket_${seat.row}${seat.number}_JosefiKonzert2026.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: '48px', height: '48px',
            border: '3px solid rgba(212,175,55,0.2)',
            borderTop: '3px solid #d4af37',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      padding: '24px 16px',
      paddingBottom: '48px',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* SUCCESS HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '24px' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            style={{
              width: '80px', height: '80px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(74,222,128,0.35)',
            }}
          >
            <CheckCircle style={{ width: '44px', height: '44px', color: '#fff' }} />
          </motion.div>

          <h1 style={{
            color: '#fff', fontSize: '28px', fontWeight: '800',
            margin: '0 0 8px', letterSpacing: '-0.5px',
          }}>
            Vielen Dank! 🎉
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: 0, lineHeight: 1.5 }}>
            Deine Tickets wurden erfolgreich gebucht.
          </p>
        </motion.div>

        {/* EMAIL HINWEIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            backgroundColor: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '14px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <Mail style={{ width: '20px', height: '20px', color: '#d4af37', flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Deine Tickets wurden an <strong style={{ color: '#d4af37' }}>{seats[0]?.email || 'deine E-Mail'}</strong> gesendet.
          </p>
        </motion.div>

        {/* EVENT INFO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar style={{ width: '16px', height: '16px', color: '#d4af37', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
              <strong style={{ color: 'white' }}>Samstag, 15. März 2026</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin style={{ width: '16px', height: '16px', color: '#d4af37', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
              <strong style={{ color: 'white' }}>Kursaal Meran</strong>
            </span>
          </div>
        </motion.div>

        {/* TICKETS */}
        {seats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: '20px' }}
          >
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px',
              paddingLeft: '4px',
            }}>
              Deine Tickets ({seats.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {seats.map((seat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px', height: '44px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))',
                      border: '1px solid rgba(212,175,55,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Ticket style={{ width: '20px', height: '20px', color: '#d4af37' }} />
                    </div>
                    <div>
                      <div style={{ color: '#d4af37', fontSize: '18px', fontWeight: '800', lineHeight: 1 }}>
                        {seat.row}{seat.number}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '3px' }}>
                        {seat.firstName} {seat.lastName}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadTicket(seat)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(212,175,55,0.15)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: '10px',
                      color: '#d4af37',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <Download style={{ width: '14px', height: '14px' }} />
                    Download
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ERROR STATE */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
              color: '#ef4444',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            ⚠️ Tickets konnten nicht geladen werden. Deine Buchung ist aber gespeichert — bitte E-Mail prüfen oder Kontakt aufnehmen.
          </motion.div>
        )}

        {/* KONTAKT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '16px',
          }}
        >
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: '0 0 12px',
          }}>
            Probleme mit der Buchung?
          </p>

          <a
            href="tel:+390473123456"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '10px',
              textDecoration: 'none',
              marginBottom: '8px',
            }}
          >
            <Phone style={{ width: '16px', height: '16px', color: '#d4af37', flexShrink: 0 }} />
            <div>
              <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>+39 0473 123 456</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Anrufen</div>
            </div>
          </a>

          <a
            href="mailto:info@bku.it"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            <Mail style={{ width: '16px', height: '16px', color: '#d4af37', flexShrink: 0 }} />
            <div>
              <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>info@bku.it</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>E-Mail schreiben</div>
            </div>
          </a>
        </motion.div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
            Bürgerkapelle Untermais · Josefi Konzert 2026
          </p>
        </div>
      </div>
    </div>
  );
}