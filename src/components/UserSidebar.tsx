'use client';

import { useState } from 'react';
import { X, ShoppingCart, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CheckoutModal from './CheckoutModal';

interface UserSidebarProps {
  selectedSeats: any[];
  onRemoveSeat: (row: string, number: number) => void;
  sessionId: string; // ⭐ Session ID für Hard Lock
  isMobile?: boolean;
}

export default function UserSidebar({ selectedSeats, onRemoveSeat, sessionId, isMobile = false }: UserSidebarProps) {
  const router = useRouter();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const ticketPrice = 20.0;
  const totalPrice = selectedSeats.length * ticketPrice;

  // ⭐ HARD LOCK beim "Zur Kassa" Button
const handleCheckoutButtonClick = async () => {
  if (selectedSeats.length === 0) {
    toast.error('Keine Sitze ausgewählt');
    return;
  }

  // ⭐ MAX 20 SITZE CHECK
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

    // Unlock alle Sitze
    try {
      await fetch('/api/seats/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error) {
      console.error('❌ Unlock Fehler:', error);
    }
  };

  // ⭐ MULTI-VOUCHER SUPPORT - Array statt String
  const handleCheckout = async (seatsWithData: any[], voucherCodes?: string[]) => {
    try {
      // ⭐ Wenn Voucher-Codes vorhanden → Prüfen wie viele
      if (voucherCodes && voucherCodes.length > 0) {
        console.log(`🎫 ${voucherCodes.length} Freikarte(n) - Reservierung`);
        
        // ⭐ Sitze mit Voucher-Codes zuordnen
        const seatsWithVouchers = seatsWithData.map((seat, index) => ({
          ...seat,
          voucherCode: voucherCodes[index] || undefined, // Jeder Sitz bekommt einen Voucher (wenn verfügbar)
        }));

        // Sitze reservieren
        const reserveResponse = await fetch('/api/seats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seats: seatsWithVouchers }),
        });

        if (!reserveResponse.ok) {
          throw new Error('Reservierung fehlgeschlagen');
        }

        // ⭐ ALLE verwendeten Voucher als "verwendet" markieren
        for (const code of voucherCodes) {
          await fetch('/api/voucher/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
        }

        // ⭐ Wenn ALLE Sitze mit Voucher → Direkt zu Success
        if (voucherCodes.length >= seatsWithData.length) {
          console.log('✅ Alle Sitze mit Freikarten - Keine Zahlung nötig');
          window.location.href = '/dashboard';
          return;
        }

        // ⭐ Wenn nur TEILWEISE Voucher → Weiter zu Stripe für restliche Sitze
        console.log(`💳 ${seatsWithData.length - voucherCodes.length} Sitze müssen bezahlt werden`);
        
        // NUR die Sitze OHNE Voucher an Stripe senden
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

      // ⭐ KEINE Voucher → Normale Stripe-Zahlung für ALLE Sitze
      console.log('💳 Normale Zahlung - Keine Freikarten');
      

      // ⭐ DIREKT ZU STRIPE - KEIN /api/seats!
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
      toast.error('Fehler beim Checkout. Bitte versuche es erneut.');
    }
  };

  return (
    <>
      <div style={{
        width: isMobile ? '100%' : '350px',
        backgroundColor: isMobile ? 'transparent' : 'rgba(0, 0, 0, 0.8)',
        backdropFilter: isMobile ? 'none' : 'blur(20px)',
        borderLeft: isMobile ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
        padding: isMobile ? '0' : '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '1rem' : '1.5rem',
        height: isMobile ? 'auto' : '100vh',
        overflowY: 'hidden',
      }}>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShoppingCart style={{ width: '24px', height: '24px', color: '#d4af37' }} />
            <h2 style={{ color: 'white', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '700', margin: 0 }}>
              Warenkorb
            </h2>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', margin: 0 }}>
            {selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'} ausgewählt
          </p>
        </div>

        {selectedSeats.length === 0 ? (
          <div style={{
            padding: isMobile ? '1.5rem' : '2rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.875rem',
          }}>
            <Ticket style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>Keine Tickets ausgewählt</p>
          </div>
        ) : (
          <>
            {/* PREIS + BUTTON OBEN */}
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: isMobile ? '1rem' : '1.5rem',
              paddingBottom: isMobile ? '1rem' : '1.5rem',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isMobile ? '1rem' : '1.5rem',
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  Gesamtpreis:
                </span>
                <span style={{ color: '#d4af37', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '700' }}>
                  {totalPrice.toFixed(2)} €
                </span>
              </div>

              {/* ⭐ HARD LOCK BUTTON */}
              <button
                onClick={handleCheckoutButtonClick}
                disabled={isLocking}
                style={{
                  width: '100%',
                  padding: isMobile ? '0.875rem' : '1rem',
                  background: isLocking 
                    ? 'rgba(212, 175, 55, 0.5)' 
                    : 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: '#000',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '700',
                  cursor: isLocking ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  opacity: isLocking ? 0.7 : 1,
                }}
              >
                {isLocking ? 'Sperre Sitze...' : `Zur Kassa (${totalPrice.toFixed(2)} €)`}
              </button>
            </div>

            {/* SITZE LISTE - SCROLLBAR */}
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              paddingRight: '0.5rem',
              maxHeight: isMobile ? '300px' : '50vh',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
            }}>
              {selectedSeats.map((seat: any) => (
                <div
                  key={`${seat.row}-${seat.number}`}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.75rem',
                    padding: isMobile ? '0.875rem' : '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <p style={{ 
                      color: 'white', 
                      fontWeight: '600', 
                      margin: '0 0 0.25rem 0',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                    }}>
                      Reihe {seat.row}, Platz {seat.number}
                    </p>
                    <p style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                      {ticketPrice.toFixed(2)} €
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveSeat(seat.row, seat.number)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      minHeight: '36px',
                    }}
                  >
                    <X style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ⭐ CHECKOUT MODAL mit Unlock beim Schließen */}
      <CheckoutModal 
        selectedSeats={selectedSeats}
        isOpen={isCheckoutOpen}
        onClose={handleModalClose}
        onCheckout={handleCheckout}
        sessionId={sessionId}  // ⭐ HINZUFÜGEN!
      />
    </>
  );
}