'use client';

import { useState, useEffect } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { X, CreditCard, User, Mail, ShoppingCart, Gift, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface MobileCheckoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Array<{ row: string; number: number }>;
  onClearSeats: () => void;
  sessionId: string; // ⭐ WICHTIG FÜR HARD LOCK + UNLOCK!
  isAdmin?: boolean;
  onReserve?: () => void;
  onMark?: () => void;
}

interface VoucherField {
  code: string;
  valid: boolean | null;
  checking: boolean;
}

export default function MobileCheckoutPanel({
  isOpen,
  onClose,
  selectedSeats,
  onClearSeats,
  sessionId,
  isAdmin = false,
  onReserve,
}: MobileCheckoutPanelProps) {
  const { data: session } = useSession();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  
  // ⭐ MULTI-VOUCHER STATE
  const [voucherFields, setVoucherFields] = useState<VoucherField[]>([
    { code: '', valid: null, checking: false }
  ]);
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const TICKET_PRICE = 20;
  const validVouchersCount = voucherFields.filter(v => v.valid === true).length;
  const paidTickets = Math.max(0, selectedSeats.length - validVouchersCount);
  const totalPrice = paidTickets * TICKET_PRICE;

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

  // ⭐ VOUCHER FUNCTIONS
  const addVoucherField = () => {
    if (voucherFields.length < selectedSeats.length) {
      setVoucherFields([...voucherFields, { code: '', valid: null, checking: false }]);
    } else {
      toast.error('Maximal ein Gutschein pro Ticket');
    }
  };

  const removeVoucherField = (index: number) => {
    if (voucherFields.length > 1) {
      setVoucherFields(voucherFields.filter((_, i) => i !== index));
    }
  };

  const updateVoucherCode = (index: number, code: string) => {
    const newFields = [...voucherFields];
    newFields[index] = { code: code.toUpperCase(), valid: null, checking: false };
    setVoucherFields(newFields);
  };

  const handleCheckVoucher = async (index: number) => {
    const code = voucherFields[index].code.trim();
    if (!code) {
      toast.error('Bitte Gutscheincode eingeben');
      return;
    }

    // Duplikat-Check
    const isDuplicate = voucherFields.some((v, i) => 
      i !== index && v.code.toUpperCase() === code.toUpperCase() && v.valid === true
    );

    if (isDuplicate) {
      toast.error('Dieser Gutschein wurde bereits verwendet');
      return;
    }

    const newFields = [...voucherFields];
    newFields[index] = { ...newFields[index], checking: true };
    setVoucherFields(newFields);

    try {
      const response = await fetch('/api/voucher/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      
      newFields[index] = { 
        code: newFields[index].code, 
        valid: data.valid, 
        checking: false 
      };
      setVoucherFields(newFields);

      if (data.valid) {
        toast.success('✓ Gutschein gültig');
      } else {
        toast.error(data.message || '✗ Ungültiger Gutschein');
      }
    } catch (error) {
      newFields[index] = { 
        code: newFields[index].code, 
        valid: false, 
        checking: false 
      };
      setVoucherFields(newFields);
      toast.error('Fehler beim Prüfen');
    }
  };

  // ⭐ HARD LOCK beim Checkout (nur für User)
  const handleCheckout = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Bitte gültige E-Mail eingeben');
      return;
    }

    if (!isAdmin && (!agreedToTerms || !agreedToPrivacy)) {
      toast.error('Bitte akzeptieren Sie die AGB und Datenschutzerklärung');
      return;
    }

    // ADMIN: Direkt reservieren ohne Stripe
    if (isAdmin && onReserve) {
      try {
        await onReserve();
        toast.success('Sitze reserviert!');
        onClose();
        onClearSeats();
      } catch (error) {
        console.error('Reserve error:', error);
        toast.error('Fehler beim Reservieren');
      }
      return;
    }

    // ⭐ USER: ERST HARD LOCK, DANN CHECKOUT
    if (selectedSeats.length > 20) {
      toast.error('Maximal 20 Sitze pro Bestellung erlaubt');
      return;
    }

    setIsLocking(true);

    try {
      // 1. HARD LOCK
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

      setIsLocking(false);
      setLoading(true);

      // 2. CHECKOUT
      const validVouchers = voucherFields
        .filter(v => v.valid === true && v.code.trim())
        .map(v => v.code.trim());

      // Wenn ALLE Tickets Freikarten sind
      if (validVouchers.length >= selectedSeats.length) {
        console.log('✅ Alle Sitze mit Freikarten');
        
        const seatsWithVouchers = selectedSeats.map((seat, index) => ({
          row: seat.row,
          number: seat.number,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          voucherCode: validVouchers[index],
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
        for (const code of validVouchers) {
          await fetch('/api/voucher/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
        }

        toast.success('✅ Tickets kostenlos reserviert!');
        window.location.href = '/dashboard';
        return;
      }

      // Wenn TEILWEISE Freikarten
      if (validVouchers.length > 0) {
        console.log(`💳 ${paidTickets} Sitze zu bezahlen, ${validVouchers.length} Freikarten`);
        
        const seatsWithData = selectedSeats.map((seat, index) => ({
          row: seat.row,
          number: seat.number,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          voucherCode: validVouchers[index] || undefined,
        }));

        // Reservieren
        const reserveResponse = await fetch('/api/seats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seats: seatsWithData }),
        });

        if (!reserveResponse.ok) {
          throw new Error('Reservierung fehlgeschlagen');
        }

        // Voucher als verwendet markieren
        for (const code of validVouchers) {
          await fetch('/api/voucher/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
        }

        // Stripe Checkout für zu bezahlende Tickets
        const seatsToPayFor = selectedSeats.slice(validVouchers.length).map(seat => ({
          row: seat.row,
          number: seat.number,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        }));

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

      // KEINE Freikarten - normale Zahlung
      console.log('💳 Normale Zahlung');
      
      const seatsWithData = selectedSeats.map(seat => ({
        row: seat.row,
        number: seat.number,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      }));

      // Reservieren
      const reserveResponse = await fetch('/api/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: seatsWithData }),
      });

      if (!reserveResponse.ok) {
        throw new Error('Reservierung fehlgeschlagen');
      }

      // Stripe Checkout
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
      console.error('❌ Checkout error:', error);
      toast.error('Fehler beim Checkout');
      setIsLocking(false);
      setLoading(false);
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
              
              {/* PREIS ANZEIGE */}
              {validVouchersCount > 0 && (
                <div style={{ marginBottom: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <div style={{ color: '#10b981', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    {validVouchersCount} Ticket{validVouchersCount > 1 ? 's' : ''} mit Freikarte
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                    {paidTickets} Ticket{paidTickets !== 1 ? 's' : ''} zu bezahlen
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(212, 175, 55, 0.2)',
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                  Gesamtpreis
                </span>
                <span style={{ color: '#d4af37', fontSize: '1.125rem', fontWeight: '700' }}>
                  €{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* ⭐ MULTI-VOUCHER - nur für User */}
            {!isAdmin && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
                maxHeight: '250px',
                overflowY: 'auto',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gift style={{ width: '18px', height: '18px', color: '#10b981' }} />
                    <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                      Freikarten-Codes
                    </div>
                  </div>
                  <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>
                    {validVouchersCount}/{selectedSeats.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {voucherFields.map((field, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <input
                          type="text"
                          value={field.code}
                          onChange={(e) => updateVoucherCode(index, e.target.value)}
                          placeholder={`CODE${index + 1}`}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.8125rem',
                            textTransform: 'uppercase',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleCheckVoucher(index)}
                          disabled={field.checking || !field.code.trim()}
                          style={{
                            padding: '0.5rem 0.875rem',
                            background: field.checking || !field.code.trim() ? 'rgba(16, 185, 129, 0.3)' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            cursor: field.checking || !field.code.trim() ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {field.checking ? '...' : 'Prüfen'}
                        </button>
                        {voucherFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVoucherField(index)}
                            style={{
                              padding: '0.5rem',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                          </button>
                        )}
                      </div>
                      {field.valid === true && (
                        <div style={{ color: '#10b981', fontSize: '0.7rem' }}>✓ Gültig</div>
                      )}
                      {field.valid === false && (
                        <div style={{ color: '#ef4444', fontSize: '0.7rem' }}>✗ Ungültig</div>
                      )}
                    </div>
                  ))}

                  {voucherFields.length < selectedSeats.length && (
                    <button
                      type="button"
                      onClick={addVoucherField}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px dashed rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        color: '#10b981',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Plus style={{ width: '16px', height: '16px' }} />
                      Weiteren Code hinzufügen
                    </button>
                  )}
                </div>
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

            {/* CHECKOUT BUTTON */}
            <button
              onClick={handleCheckout}
              disabled={isLocking || loading || (!isAdmin && (!agreedToTerms || !agreedToPrivacy))}
              style={{
                width: '100%',
                padding: '16px',
                background: isLocking || loading || (!isAdmin && (!agreedToTerms || !agreedToPrivacy))
                  ? 'rgba(212, 175, 55, 0.3)' 
                  : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#0a0a0a',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: isLocking || loading || (!isAdmin && (!agreedToTerms || !agreedToPrivacy)) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: isLocking || loading || (!isAdmin && (!agreedToTerms || !agreedToPrivacy)) 
                  ? 'none' 
                  : '0 4px 12px rgba(212, 175, 55, 0.3)',
                opacity: isLocking || loading || (!isAdmin && (!agreedToTerms || !agreedToPrivacy)) ? 0.7 : 1,
              }}
            >
              <CreditCard style={{ width: '20px', height: '20px' }} />
              {isLocking 
                ? 'Sperre Sitze...'
                : loading 
                  ? 'Lädt...' 
                  : isAdmin 
                    ? 'Reservieren' 
                    : totalPrice === 0
                      ? 'Kostenlos reservieren'
                      : `Zur Zahlung (€${totalPrice.toFixed(2)})`
              }
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}