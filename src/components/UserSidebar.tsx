'use client';

import { useState } from 'react';
import { X, ShoppingCart, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CheckoutModal from './CheckoutModal';

interface UserSidebarProps {
  selectedSeats: any[];
  onRemoveSeat: (row: string, number: number) => void;
  isMobile?: boolean;
}

export default function UserSidebar({ selectedSeats, onRemoveSeat, isMobile = false }: UserSidebarProps) {
  const router = useRouter();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const ticketPrice = 20.0;
  const totalPrice = selectedSeats.length * ticketPrice;

  const handleCheckout = async (seatsWithData: any[], voucherCode?: string) => {
    try {
      // Wenn Voucher-Code vorhanden → Direkt reservieren ohne Zahlung!
      if (voucherCode) {
        console.log('🎫 Freikarte - Direkte Reservierung');
        
        const reserveResponse = await fetch('/api/seats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            seats: seatsWithData.map(s => ({
              ...s,
              voucherCode: voucherCode
            }))
          }),
        });

        if (!reserveResponse.ok) {
          throw new Error('Reservierung fehlgeschlagen');
        }

        // Voucher als verwendet markieren
        await fetch('/api/voucher/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: voucherCode }),
        });

        // Direkt zur Success-Seite
        window.location.href = '/dashboard';
        return;
      }

      // Normale Zahlung mit Stripe
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
      alert('Fehler beim Checkout. Bitte versuche es erneut.');
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
        overflowY: 'hidden', // ⭐ GEÄNDERT: Kein Scroll auf dem Container
      }}>
        
        {/* HEADER */}
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
            {/* ⭐ PREIS + BUTTON - JETZT HIER OBEN! */}
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

              <button
                onClick={() => setIsCheckoutOpen(true)}
                style={{
                  width: '100%',
                  padding: isMobile ? '0.875rem' : '1rem',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: '#000',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                Zur Kassa ({totalPrice.toFixed(2)} €)
              </button>
            </div>

            {/* ⭐ SITZE LISTE - SCROLLBAR MIT MAX HEIGHT */}
            <div style={{ 
              flex: 1,
              overflowY: 'auto', // ⭐ NUR DIE LISTE SCROLLT!
              paddingRight: '0.5rem',
              maxHeight: isMobile ? '300px' : '50vh', // ⭐ MAX HEIGHT!
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
                    flexShrink: 0, // ⭐ Verhindert Schrumpfen
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

      <CheckoutModal 
        selectedSeats={selectedSeats}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onCheckout={handleCheckout}
      />
    </>
  );
}