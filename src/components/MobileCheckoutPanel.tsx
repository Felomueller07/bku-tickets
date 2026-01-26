'use client';

import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, CreditCard, User, Mail, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface MobileCheckoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Array<{ row: string; number: number }>;
  onClearSeats: () => void;
}

export default function MobileCheckoutPanel({
  isOpen,
  onClose,
  selectedSeats,
  onClearSeats,
}: MobileCheckoutPanelProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const TICKET_PRICE = 25; // €25 pro Ticket
  const totalPrice = selectedSeats.length * TICKET_PRICE;

  // Drag to close
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const handleCheckout = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Bitte gültige E-Mail eingeben');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: selectedSeats,
          customerEmail: email,
          customerName: `${firstName} ${lastName}`,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      if (url) {
        // Redirect zu Stripe Checkout
        window.location.href = url;
      } else {
        toast.error('Keine Checkout-URL erhalten');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Fehler beim Checkout');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
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
          maxHeight: '85vh',
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
                Checkout
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
          {/* SELECTED SEATS */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              color: '#d4af37',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
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
                    padding: '4px 8px',
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

          {/* FORM */}
          <div style={{ marginBottom: '1.5rem' }}>
            {/* First Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'block',
                marginBottom: '0.5rem',
              }}>
                Vorname
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '18px',
                  height: '18px',
                  color: 'rgba(255, 255, 255, 0.4)',
                }} />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Max"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Last Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'block',
                marginBottom: '0.5rem',
              }}>
                Nachname
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '18px',
                  height: '18px',
                  color: 'rgba(255, 255, 255, 0.4)',
                }} />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'block',
                marginBottom: '0.5rem',
              }}>
                E-Mail
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '18px',
                  height: '18px',
                  color: 'rgba(255, 255, 255, 0.4)',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@beispiel.de"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* PRICE */}
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
              marginBottom: '0.5rem',
            }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} × €{TICKET_PRICE}
              </span>
              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
                €{selectedSeats.length * TICKET_PRICE}
              </span>
            </div>
            <div style={{
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '0.75rem 0',
            }}></div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700' }}>
                Gesamt
              </span>
              <span style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '700' }}>
                €{totalPrice}
              </span>
            </div>
          </div>

          {/* CHECKOUT BUTTON */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading 
                ? 'rgba(212, 175, 55, 0.5)' 
                : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#0a0a0a',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
            }}
          >
            <CreditCard style={{ width: '20px', height: '20px' }} />
            {loading ? 'Lädt...' : 'Zur Zahlung'}
          </button>
        </div>
      </motion.div>
    </>
  );
}