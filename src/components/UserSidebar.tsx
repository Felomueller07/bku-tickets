'use client';

import { useState } from 'react';
import { X, ShoppingCart, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface UserSidebarProps {
  selectedSeats: any[];
  onRemoveSeat: (row: string, number: number) => void;
}

export default function UserSidebar({ selectedSeats, onRemoveSeat }: UserSidebarProps) {
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const ticketPrice = 20.0;
  const totalPrice = selectedSeats.length * ticketPrice;

  const handleCheckout = async () => {
    if (!agbAccepted || !privacyAccepted) {
      toast.error('Bitte akzeptieren Sie die AGB und Datenschutzerklärung');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Sitzplatz aus');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: selectedSeats }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Fehler beim Erstellen der Zahlung');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Ein Fehler ist aufgetreten');
      setIsProcessing(false);
    }
  };

  return (
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
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', margin: 0 }}>
                  {seat.firstName} {seat.lastName}
                </p>
                <p style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '600', margin: '0.5rem 0 0 0' }}>
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
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            cursor: 'pointer',
            marginBottom: '0.75rem',
          }}>
            <input
              type="checkbox"
              checked={agbAccepted}
              onChange={(e) => setAgbAccepted(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                marginTop: '2px',
                cursor: 'pointer',
                accentColor: '#d4af37',
              }}
            />
            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Ich akzeptiere die{' '}
              <Link
                href="/agb"
                target="_blank"
                style={{ color: '#d4af37', textDecoration: 'underline' }}
              >
                AGB
              </Link>
              {' '}*
            </span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                marginTop: '2px',
                cursor: 'pointer',
                accentColor: '#d4af37',
              }}
            />
            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Ich akzeptiere die{' '}
              <Link
                href="/datenschutz"
                target="_blank"
                style={{ color: '#d4af37', textDecoration: 'underline' }}
              >
                Datenschutzerklärung
              </Link>
              {' '}*
            </span>
          </label>

          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.625rem',
            margin: '0.75rem 0 0 0',
          }}>
            * Pflichtfelder
          </p>
        </div>
      )}

      {selectedSeats.length > 0 && (
        <>
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1rem',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
                Gesamtpreis:
              </span>
              <span style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '700' }}>
                {totalPrice.toFixed(2)} €
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!agbAccepted || !privacyAccepted || isProcessing}
              style={{
                width: '100%',
                padding: '1rem',
                background: (agbAccepted && privacyAccepted && !isProcessing)
                  ? 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '0.75rem',
                color: (agbAccepted && privacyAccepted && !isProcessing) ? '#000' : 'rgba(255, 255, 255, 0.3)',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: (agbAccepted && privacyAccepted && !isProcessing) ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                opacity: isProcessing ? 0.7 : 1,
              }}
            >
              {isProcessing ? 'Wird verarbeitet...' : `Zur Kassa (${totalPrice.toFixed(2)} €)`}
            </button>

            {(!agbAccepted || !privacyAccepted) && (
              <p style={{
                color: 'rgba(239, 68, 68, 0.8)',
                fontSize: '0.75rem',
                textAlign: 'center',
                margin: '0.75rem 0 0 0',
              }}>
                Bitte akzeptieren Sie die AGB und Datenschutzerklärung
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
