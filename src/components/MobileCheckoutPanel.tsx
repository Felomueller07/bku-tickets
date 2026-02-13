'use client';

import { useState } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import CheckoutModal from './CheckoutModal';

interface MobileCheckoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Array<{ row: string; number: number }>;
  onClearSeats: () => void;
  sessionId: string;
  isAdmin?: boolean;
  onReserve?: () => void;
  onMark?: () => void;
}

export default function MobileCheckoutPanel({
  isOpen,
  onClose,
  selectedSeats,
  onClearSeats,
  sessionId,
  isAdmin = false,
  onReserve,
  onMark,
}: MobileCheckoutPanelProps) {
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const TICKET_PRICE = 20;
  const totalPrice = selectedSeats.length * TICKET_PRICE;

  // Drag to close
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  // ⭐ HARD LOCK + CHECKOUT MODAL ÖFFNEN (nur für User)
  const handleCheckoutClick = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Keine Sitze ausgewählt');
      return;
    }

    if (selectedSeats.length > 20) {
      toast.error('Maximal 20 Sitze pro Bestellung erlaubt');
      return;
    }

    setIsLocking(true);

    try {
      const hardLockResponse = await fetch('/api/seats/hard-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: selectedSeats.map(s => ({ row: s.row, number: s.number })),
          sessionId: sessionId,
        }),
      });

      if (!hardLockResponse.ok) {
        const data = await hardLockResponse.json();
        toast.error(data.error || 'Sitze konnten nicht gesperrt werden');
        setIsLocking(false);
        return;
      }

      // Hard Lock erfolgreich → CheckoutModal öffnen
      onClose();
      setIsCheckoutOpen(true);
      setIsLocking(false);

    } catch (error) {
      console.error('❌ Hard Lock Fehler:', error);
      toast.error('Fehler beim Sperren der Sitze');
      setIsLocking(false);
    }
  };

  // ⭐ UNLOCK beim Modal schließen
  const handleModalClose = async () => {
    setIsCheckoutOpen(false);

    try {
      await fetch('/api/seats/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (error) {
      console.error('❌ Unlock Fehler:', error);
    }
  };

  // ⭐ CHECKOUT HANDLER (weitergeleitet an CheckoutModal)
  const handleCheckout = async (seatsWithData: any[], voucherCodes?: string[]) => {
    try {
      // Freikarten-Logik
      if (voucherCodes && voucherCodes.length > 0) {
        console.log(`🎫 ${voucherCodes.length} Freikarte(n)`);
        
        const seatsWithVouchers = seatsWithData.map((seat, index) => ({
          ...seat,
          voucherCode: voucherCodes[index] || undefined,
        }));

        // Reservieren
        const reserveResponse = await fetch('/api/seats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seats: seatsWithVouchers }),
        });

        if (!reserveResponse.ok) {
          throw new Error('Reservierung fehlgeschlagen');
        }

        // Voucher als verwendet markieren
        for (const code of voucherCodes) {
          await fetch('/api/voucher/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
        }

        // Wenn ALLE Tickets Freikarten sind → Dashboard
        if (voucherCodes.length >= seatsWithData.length) {
          console.log('✅ Alle Sitze mit Freikarten');
          window.location.href = '/dashboard';
          return;
        }

        // Teilweise Freikarten → Stripe für Rest
        console.log(`💳 ${seatsWithData.length - voucherCodes.length} Sitze zu bezahlen`);
        
        const seatsToPayFor = seatsWithData.slice(voucherCodes.length);
        
        const checkoutResponse = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seats: seatsToPayFor }),
        });

        const { url } = await checkoutResponse.json();
        
        if (url) {
          window.location.href = url;
        }
        return;
      }

      // Keine Freikarten - normale Zahlung
      console.log('💳 Normale Zahlung');
      
      const reserveResponse = await fetch('/api/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: seatsWithData }),
      });

      if (!reserveResponse.ok) {
        throw new Error('Reservierung fehlgeschlagen');
      }

      const checkoutResponse = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: seatsWithData }),
      });

      const { url } = await checkoutResponse.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('❌ Checkout Fehler:', error);
      toast.error('Fehler beim Checkout');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
          }}
        />

        {/* SLIDE PANEL */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '75vh',
            backgroundColor: '#0a0a0a',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            zIndex: 201,
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* DRAG HANDLE */}
          <div style={{
            padding: '12px 0',
            display: 'flex',
            justifyContent: 'center',
            cursor: 'grab',
          }}>
            <div style={{
              width: '40px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
            }}></div>
          </div>

          {/* HEADER */}
          <div style={{
            padding: '0 1.5rem 1rem',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShoppingCart style={{ width: '20px', height: '20px', color: '#d4af37' }} />
                <h3 style={{
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: 0,
                }}>
                  Warenkorb
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: '20px', height: '20px', color: 'white' }} />
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
          }}>
            {selectedSeats.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'rgba(255, 255, 255, 0.5)',
              }}>
                <p>Keine Sitze ausgewählt</p>
              </div>
            ) : (
              <>
                {/* SITZE LISTE */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    color: '#d4af37',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                  }}>
                    Ausgewählte Sitze ({selectedSeats.length})
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}>
                    {selectedSeats.map(seat => (
                      <div
                        key={`${seat.row}${seat.number}`}
                        style={{
                          background: 'rgba(212, 175, 55, 0.2)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          borderRadius: '6px',
                          padding: '4px 12px',
                          color: '#d4af37',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                        }}
                      >
                        {seat.row}{seat.number}
                      </div>
                    ))}
                  </div>
                </div>

                {/* PREIS */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                      {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} × €{TICKET_PRICE}
                    </span>
                    <span style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '700' }}>
                      €{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FOOTER mit Buttons */}
          {selectedSeats.length > 0 && (
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.3)',
            }}>
              {isAdmin ? (
                // ADMIN BUTTONS
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    onClick={onReserve}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#0a0a0a',
                      fontSize: '0.9375rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Reservieren
                  </button>
                  <button
                    onClick={onMark}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'rgba(212, 175, 55, 0.2)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '12px',
                      color: '#d4af37',
                      fontSize: '0.9375rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Vormerken
                  </button>
                </div>
              ) : (
                // USER BUTTON - Zur Kassa
                <button
                  onClick={handleCheckoutClick}
                  disabled={isLocking}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: isLocking 
                      ? 'rgba(212, 175, 55, 0.5)' 
                      : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0a0a0a',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: isLocking ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    opacity: isLocking ? 0.7 : 1,
                  }}
                >
                  <CreditCard style={{ width: '20px', height: '20px' }} />
                  {isLocking ? 'Sperre Sitze...' : `Zur Kassa (€${totalPrice.toFixed(2)})`}
                </button>
              )}

              {/* ALLE LÖSCHEN */}
              <button
                onClick={onClearSeats}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Alle entfernen
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ⭐ CHECKOUT MODAL - FUNKTIONIERT FÜR MOBILE UND DESKTOP! */}
      <CheckoutModal
        selectedSeats={selectedSeats}
        isOpen={isCheckoutOpen}
        onClose={handleModalClose}
        onCheckout={handleCheckout}
        sessionId={sessionId}
      />
    </>
  );
}