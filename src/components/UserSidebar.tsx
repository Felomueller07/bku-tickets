'use client';

import { useState } from 'react';
import { X, ShoppingCart, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CheckoutModal from './CheckoutModal';

interface UserSidebarProps {
  selectedSeats: any[];
  onRemoveSeat: (row: string, number: number) => void;
}

export default function UserSidebar({ selectedSeats, onRemoveSeat }: UserSidebarProps) {
  const router = useRouter();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const ticketPrice = 20.0;
  const totalPrice = selectedSeats.length * ticketPrice;

  const handleCheckout = async (seatsWithData: any[]) => {
    try {
      // 1. Sitze reservieren
      const reserveResponse = await fetch('/api/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: seatsWithData }),
      });

      if (!reserveResponse.ok) {
        throw new Error('Reservierung fehlgeschlagen');
      }

      // 2. Stripe Checkout Session erstellen
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
        width: '350px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(212, 175, 55, 0.3)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        height: '100vh',
        overflowY: 'auto',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShoppingCart style={{ width: '24px', height: '24px', color: '#d4af37' }} />
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              Warenkorb
            </h2>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', margin: 0 }}>
            {selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'} ausgewählt
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {selectedSeats.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
            }}>
              <Ticket style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>Keine Tickets ausgewählt</p>
            </div>
          ) : (
            selectedSeats.map((seat: any) => (
              <div
                key={`${seat.row}-${seat.number}`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ color: 'white', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
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
                  }}
                >
                  <X style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                </button>
              </div>
            ))
          )}
        </div>

        {selectedSeats.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
                Gesamtpreis:
              </span>
              <span style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '700' }}>
                {totalPrice.toFixed(2)} €
              </span>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
                border: 'none',
                borderRadius: '0.75rem',
                color: '#000',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              Zur Kassa ({totalPrice.toFixed(2)} €)
            </button>
          </div>
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
