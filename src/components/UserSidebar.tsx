'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CreditCard, Trash2, Loader2, Ticket, Gift } from 'lucide-react';

interface UserSidebarProps {
  selectedSeats: Array<{ row: string; number: number }>;
  onDeselectSeat: (row: string, number: number) => void;
  onCheckout: () => void;
}

const PRICE_PER_SEAT = 20.00;

export default function UserSidebar({
  selectedSeats,
  onDeselectSeat,
}: UserSidebarProps) {
  
  const totalPrice = selectedSeats.length * PRICE_PER_SEAT;
  const [loading, setLoading] = useState(false);
  const [freeTicketCode, setFreeTicketCode] = useState('');
  const [showFreeTicket, setShowFreeTicket] = useState(false);
  const [freeTicketLoading, setFreeTicketLoading] = useState(false);

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;
    
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: selectedSeats }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert('Fehler: ' + (error.error || 'Checkout fehlgeschlagen'));
        setLoading(false);
        return;
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        alert('Keine Checkout-URL erhalten');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Ein Fehler ist aufgetreten');
      setLoading(false);
    }
  };

  const handleFreeTicket = async () => {
    if (!freeTicketCode.trim()) {
      alert('Bitte gib einen Code ein');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Bitte wähle zuerst Sitze aus');
      return;
    }

    setFreeTicketLoading(true);

    try {
      console.log('🎟️ Prüfe Freikarten-Code:', freeTicketCode);

      const response = await fetch('/api/free-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: freeTicketCode,
          seats: selectedSeats 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Freikarte eingelöst! Deine Sitze wurden reserviert.');
        window.location.href = '/dashboard';
      } else {
        alert('❌ ' + (data.error || 'Ungültiger Code'));
      }
    } catch (error) {
      console.error('Free Ticket Error:', error);
      alert('Ein Fehler ist aufgetreten');
    } finally {
      setFreeTicketLoading(false);
    }
  };

  return (
    <motion.div
      style={{
        width: '340px',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        padding: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        position: 'sticky',
        top: '2rem',
        maxHeight: 'calc(100vh - 4rem)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          color: 'white', 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          margin: 0,
          letterSpacing: '-0.025em',
        }}>
          Warenkorb
        </h3>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.5)', 
          fontSize: '0.875rem', 
          margin: 0,
          marginTop: '0.25rem',
        }}>
          Josefi Konzert 2026
        </p>
      </div>

      {/* AUSGEWÄHLTE SITZE */}
      {selectedSeats.length > 0 ? (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ 
              color: 'white', 
              fontSize: '0.9375rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <ShoppingCart style={{ width: '16px', height: '16px' }} />
              Ausgewählte Sitze
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.5)', 
                fontSize: '0.8125rem',
                fontWeight: '500',
              }}>
                ({selectedSeats.length})
              </span>
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedSeats.map(({ row, number }, index) => (
                <motion.div
                  key={`${row}${number}-${index}`}
                  style={{
                    backgroundColor: 'rgba(74, 222, 128, 0.15)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <span style={{ 
                      color: '#fff',
                      fontWeight: '600', 
                      fontSize: '1rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      Sitz {row}{number}
                    </span>
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.8125rem',
                      marginTop: '0.125rem',
                    }}>
                      {PRICE_PER_SEAT.toFixed(2)} €
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => onDeselectSeat(row, number)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={loading || freeTicketLoading}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: (loading || freeTicketLoading) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: (loading || freeTicketLoading) ? 0.5 : 1,
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* PREIS-ZUSAMMENFASSUNG */}
          <div style={{ 
            marginBottom: '2rem',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
            borderRadius: '1rem',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}>
                <span>{selectedSeats.length} × {PRICE_PER_SEAT.toFixed(2)} €</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
            </div>
            
            <div style={{ 
              borderTop: '1px solid rgba(212, 175, 55, 0.3)',
              paddingTop: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}>
                Gesamtpreis
              </span>
              <div style={{ 
                color: '#d4af37',
                fontSize: '1.75rem',
                fontWeight: '700',
                fontVariantNumeric: 'tabular-nums',
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.25rem',
              }}>
                <span>{totalPrice.toFixed(2)}</span>
                <span style={{ fontSize: '1.25rem' }}>€</span>
              </div>
            </div>
          </div>

          {/* ZUR KASSA BUTTON */}
          <motion.button
            onClick={handleCheckout}
            disabled={loading || freeTicketLoading}
            whileHover={{ scale: (loading || freeTicketLoading) ? 1 : 1.02 }}
            whileTap={{ scale: (loading || freeTicketLoading) ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '1rem',
              background: (loading || freeTicketLoading)
                ? 'rgba(212, 175, 55, 0.5)' 
                : 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
              color: '#000',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: (loading || freeTicketLoading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: (loading || freeTicketLoading) ? 'none' : '0 4px 12px rgba(212, 175, 55, 0.3)',
              marginBottom: '1rem',
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                Wird geladen...
              </>
            ) : (
              <>
                <CreditCard style={{ width: '18px', height: '18px' }} />
                Zur Kassa ({totalPrice.toFixed(2)} €)
              </>
            )}
          </motion.button>

          {/* FREIKARTE BUTTON/FELD */}
          <motion.button
            onClick={() => setShowFreeTicket(!showFreeTicket)}
            disabled={loading || freeTicketLoading}
            whileHover={{ scale: (loading || freeTicketLoading) ? 1 : 1.02 }}
            whileTap={{ scale: (loading || freeTicketLoading) ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: showFreeTicket 
                ? 'rgba(139, 92, 246, 0.2)' 
                : 'rgba(139, 92, 246, 0.1)',
              color: '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: (loading || freeTicketLoading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: showFreeTicket ? '1rem' : 0,
            }}
          >
            <Gift style={{ width: '18px', height: '18px' }} />
            Freikarte einlösen
          </motion.button>

          {/* FREIKARTEN EINGABEFELD */}
          <AnimatePresence>
            {showFreeTicket && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '1.25rem',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '0.75rem',
                }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                  }}>
                    Freikarten-Code
                  </label>
                  
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <Ticket style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }} />
                    <input
                      type="text"
                      value={freeTicketCode}
                      onChange={(e) => setFreeTicketCode(e.target.value.toUpperCase())}
                      placeholder="JOSEFI2026-ABC123"
                      disabled={freeTicketLoading}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        letterSpacing: '0.05em',
                        outline: 'none',
                        textTransform: 'uppercase',
                      }}
                    />
                  </div>

                  <motion.button
                    onClick={handleFreeTicket}
                    disabled={freeTicketLoading}
                    whileHover={{ scale: freeTicketLoading ? 1 : 1.02 }}
                    whileTap={{ scale: freeTicketLoading ? 1 : 0.98 }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: freeTicketLoading
                        ? 'rgba(139, 92, 246, 0.5)'
                        : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      cursor: freeTicketLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {freeTicketLoading ? (
                      <>
                        <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                        Prüfe Code...
                      </>
                    ) : (
                      <>
                        <Gift style={{ width: '16px', height: '16px' }} />
                        Code einlösen
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SICHERE ZAHLUNG HINWEIS */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.2)',
            borderRadius: '0.5rem',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.75rem',
              margin: 0,
            }}>
              🔒 Sichere Zahlung via Stripe
            </p>
          </div>
        </>
      ) : (
        <div style={{ 
          marginBottom: 'auto', 
          textAlign: 'center', 
          padding: '2rem 0',
        }}>
          <ShoppingCart style={{ 
            width: '48px', 
            height: '48px', 
            color: 'rgba(255, 255, 255, 0.2)',
            margin: '0 auto 1rem',
          }} />
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.4)', 
            fontSize: '0.875rem',
            margin: 0,
          }}>
            Keine Sitze ausgewählt
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
