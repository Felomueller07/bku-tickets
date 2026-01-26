'use client';

import { useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, CreditCard, User, Mail, ShoppingCart, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface MobileCheckoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Array<{ row: string; number: number }>;
  onClearSeats: () => void;
  isAdmin?: boolean;
  onReserve?: () => void;
}

export default function MobileCheckoutPanel({
  isOpen,
  onClose,
  selectedSeats,
  onClearSeats,
  isAdmin = false,
  onReserve,
}: MobileCheckoutPanelProps) {
  const { data: session } = useSession();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null);
  const [voucherChecking, setVoucherChecking] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const TICKET_PRICE = 20; // €20 pro Ticket
  const totalPrice = voucherValid ? 0 : selectedSeats.length * TICKET_PRICE;

  // Pre-fill user data from session
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [session]);

  // Drag to close
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const handleCheckVoucher = async () => {
    if (!voucherCode.trim()) return;

    setVoucherChecking(true);
    try {
      const response = await fetch('/api/voucher/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode }),
      });

      const data = await response.json();
      setVoucherValid(data.valid);
      
      if (data.valid) {
        toast.success('✓ Freikarten-Code gültig!');
      } else {
        toast.error('✗ Ungültiger Code');
      }
    } catch (error) {
      setVoucherValid(false);
      toast.error('Fehler beim Prüfen des Codes');
    } finally {
      setVoucherChecking(false);
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

    if (!agreedToTerms || !agreedToPrivacy) {
      toast.error('Bitte akzeptieren Sie die AGB und Datenschutzerklärung');
      return;
    }

    setLoading(true);

    // ADMIN: Direkt reservieren ohne Stripe
    if (isAdmin && onReserve) {
      try {
        await onReserve();
        toast.success('Sitze reserviert!');
        onClose();
        onClearSeats();
        setLoading(false);
      } catch (error) {
        console.error('Reserve error:', error);
        toast.error('Fehler beim Reservieren');
        setLoading(false);
      }
      return;
    }

    // USER: Mit Stripe Checkout
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: selectedSeats,
          customerEmail: email,
          customerName: `${firstName} ${lastName}`,
          voucherCode: voucherValid ? voucherCode : null,
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
          maxHeight: '90vh',
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
                {isAdmin ? 'Reservieren' : 'Checkout'}
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
              marginBottom: '0.75rem',
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                Preis pro Ticket
              </span>
              <span style={{ color: '#d4af37', fontSize: '1.125rem', fontWeight: '700' }}>
                {voucherValid ? '€0' : `€${TICKET_PRICE}`}
              </span>
            </div>
            {!voucherValid && (
              <div style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                textAlign: 'right',
              }}>
                Josefi Konzert 2026
              </div>
            )}
          </div>

          {/* FREIKARTEN-CODE - nur für User */}
          {!isAdmin && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}>
                <Gift style={{ width: '18px', height: '18px', color: '#10b981' }} />
                <div style={{
                  color: '#10b981',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}>
                  Freikarten-Code
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setVoucherValid(null);
                  }}
                  placeholder="CODE123"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCheckVoucher}
                  disabled={voucherChecking || !voucherCode.trim()}
                  style={{
                    padding: '10px 16px',
                    background: voucherChecking || !voucherCode.trim() ? 'rgba(16, 185, 129, 0.3)' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: voucherChecking || !voucherCode.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {voucherChecking ? '...' : 'Prüfen'}
                </button>
              </div>
              {voucherValid === true && (
                <div style={{
                  color: '#10b981',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  ✓ Code gültig! Freikarte aktiviert
                </div>
              )}
              {voucherValid === false && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  ✗ Ungültiger Code
                </div>
              )}
            </div>
          )}

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
                Vorname *
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
                  required
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
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
                Nachname *
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
                  required
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
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
                E-Mail *
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
                  required
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}>
                <Mail size={12} />
                Die Tickets werden an diese E-Mail-Adresse gesendet.
              </div>
            </div>
          </div>

          {/* AGB & DATENSCHUTZ - nur für User */}
          {!isAdmin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                />
                <span style={{
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                }}>
                  Ich akzeptiere die{' '}
                  <a href="/agb" target="_blank" style={{ color: '#d4af37', textDecoration: 'underline' }}>
                    AGB
                  </a>{' '}
                  *
                </span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  required
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                />
                <span style={{
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                }}>
                  Ich akzeptiere die{' '}
                  <a href="/datenschutz" target="_blank" style={{ color: '#d4af37', textDecoration: 'underline' }}>
                    Datenschutzerklärung
                  </a>{' '}
                  *
                </span>
              </label>
            </div>
          )}

          {/* PRICE - nur für User */}
          {!isAdmin && (
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
                  €{voucherValid ? 0 : selectedSeats.length * TICKET_PRICE}
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
          )}

          {/* CHECKOUT BUTTON */}
          <button
            onClick={handleCheckout}
            disabled={loading || (!isAdmin && (!agreedToTerms || !agreedToPrivacy))}
            style={{
              width: '100%',
              padding: '16px',
              background: loading || (!isAdmin && (!agreedToTerms || !agreedToPrivacy))
                ? 'rgba(212, 175, 55, 0.3)' 
                : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#0a0a0a',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading || (!isAdmin && (!agreedToTerms || !agreedToPrivacy)) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: loading || (!isAdmin && (!agreedToTerms || !agreedToPrivacy)) 
                ? 'none' 
                : '0 4px 12px rgba(212, 175, 55, 0.3)',
            }}
          >
            <CreditCard style={{ width: '20px', height: '20px' }} />
            {loading 
              ? 'Lädt...' 
              : isAdmin 
                ? 'Reservieren' 
                : voucherValid 
                  ? 'Kostenlos reservieren'
                  : 'Zur Zahlung'}
          </button>
        </div>
      </motion.div>
    </>
  );
}