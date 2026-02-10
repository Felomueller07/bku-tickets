'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Mail, User, Gift, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Array<{ row: string; number: number }>;
  onCheckout: (seats: any[], voucherCodes?: string[]) => void;
}

interface VoucherField {
  code: string;
  valid: boolean | null;
  checking: boolean;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedSeats,
  onCheckout,
}: CheckoutModalProps) {
  const { data: session } = useSession();
  
  const [timeLeft, setTimeLeft] = useState(600);
  
  // ⭐ MULTI-VOUCHER STATE
  const [voucherFields, setVoucherFields] = useState<VoucherField[]>([
    { code: '', valid: null, checking: false }
  ]);
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [seatData, setSeatData] = useState(
    selectedSeats.map((seat) => ({
      ...seat,
      firstName: '',
      lastName: '',
    }))
  );

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(600);
      setVoucherFields([{ code: '', valid: null, checking: false }]);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error('⚠️ Zeit abgelaufen! Sitze wurden freigegeben.');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (timeLeft === 120) {
      toast.warning('⚠️ Nur noch 2 Minuten! Bitte schnell abschließen.');
    }
  }, [timeLeft]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setContactData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [session]);

  useEffect(() => {
    setSeatData(
      selectedSeats.map((seat) => ({
        ...seat,
        firstName: '',
        lastName: '',
      }))
    );
  }, [selectedSeats]);

  // ⭐ VOUCHER FUNCTIONS
  const addVoucherField = () => {
    if (voucherFields.length < selectedSeats.length) {
      setVoucherFields([...voucherFields, { code: '', valid: null, checking: false }]);
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
    if (!code) return;

    // Set checking
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
    } catch (error) {
      newFields[index] = { 
        code: newFields[index].code, 
        valid: false, 
        checking: false 
      };
      setVoucherFields(newFields);
    }
  };

  // ⭐ PREIS BERECHNUNG
  const validVouchersCount = voucherFields.filter(v => v.valid === true).length;
  const paidTickets = Math.max(0, selectedSeats.length - validVouchersCount);
  const totalPrice = paidTickets * 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const seatsWithData = seatData.map((seat) => ({
      row: seat.row,
      number: seat.number,
      firstName: seat.firstName || contactData.firstName,
      lastName: seat.lastName || contactData.lastName,
      email: contactData.email,
    }));

    // ⭐ NUR gültige Voucher-Codes weitergeben
    const validVouchers = voucherFields
      .filter(v => v.valid === true)
      .map(v => v.code);

    onCheckout(seatsWithData, validVouchers.length > 0 ? validVouchers : undefined);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const progressPercentage = (timeLeft / 600) * 100;
  const isUrgent = timeLeft < 120;
  const timerColor = isUrgent ? '#ef4444' : '#d4af37';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '0' : '1rem',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? '100%' : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? '100%' : 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: isMobile ? '1.5rem 1.5rem 0 0' : '1rem',
            padding: isMobile ? '1.5rem' : '2rem',
            maxWidth: isMobile ? '100%' : '850px',
            width: '100%',
            maxHeight: isMobile ? '90vh' : '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          {isMobile && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem',
              marginTop: '-0.5rem',
            }}>
              <div style={{
                width: '40px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '2px',
              }} />
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: isMobile ? '1rem' : '1.25rem',
          }}>
            <h2 style={{ 
              color: '#d4af37', 
              fontSize: isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: '700',
              margin: 0,
            }}>
              Checkout
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <motion.div
                animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                  border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(212, 175, 55, 0.3)'}`,
                  borderRadius: '0.5rem',
                }}
              >
                {isUrgent ? (
                  <AlertCircle style={{ color: timerColor, width: '18px', height: '18px' }} />
                ) : (
                  <Clock style={{ color: timerColor, width: '18px', height: '18px' }} />
                )}
                <span style={{ 
                  color: timerColor, 
                  fontSize: isMobile ? '1.125rem' : '1.25rem',
                  fontWeight: '700',
                  fontFamily: 'monospace',
                }}>
                  {timeString}
                </span>
              </motion.div>

              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  padding: '0.5rem',
                }}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: isMobile ? '1rem' : '1.5rem',
          }}>
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1 }}
              style={{
                height: '100%',
                background: isUrgent 
                  ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(90deg, #d4af37 0%, #f4e7c3 100%)',
                borderRadius: '3px',
              }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '1rem' : '1.25rem',
              marginBottom: isMobile ? '1rem' : '1.5rem',
            }}>
              {/* Ausgewählte Sitze */}
              <div style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '0.75rem',
                padding: isMobile ? '1rem' : '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <CreditCard style={{ color: '#d4af37', width: '20px', height: '20px' }} />
                  <h3 style={{ color: '#d4af37', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                    Ausgewählte Sitze
                  </h3>
                </div>
                <p style={{ color: '#fff', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                  Reihe {selectedSeats[0]?.row}, Platz {selectedSeats.map(s => s.number).join(', ')}
                </p>
                
                {/* ⭐ PREIS-AUFSCHLÜSSELUNG */}
                {validVouchersCount > 0 ? (
                  <>
                    <p style={{ color: '#10b981', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      {validVouchersCount} Ticket{validVouchersCount > 1 ? 's' : ''} mit Freikarte
                    </p>
                    <p style={{ color: '#fff', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      {paidTickets} Ticket{paidTickets !== 1 ? 's' : ''} zu bezahlen
                    </p>
                  </>
                ) : null}
                
                <p style={{ color: '#d4af37', fontSize: '1.25rem', fontWeight: '700', margin: '0.5rem 0 0.25rem 0' }}>
                  {totalPrice.toFixed(2)} €
                </p>
                <p style={{ color: '#999', fontSize: '0.75rem', margin: 0 }}>
                  Josefi Konzert 2026
                </p>
              </div>

              {/* ⭐ MULTI-VOUCHER SECTION */}
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.75rem',
                padding: isMobile ? '1rem' : '1.25rem',
                maxHeight: '300px',
                overflowY: 'auto',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gift style={{ color: '#10b981', width: '20px', height: '20px' }} />
                    <h3 style={{ color: '#10b981', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                      Freikarten-Codes
                    </h3>
                  </div>
                  <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>
                    {validVouchersCount}/{selectedSeats.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {voucherFields.map((field, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <input
                            type="text"
                            value={field.code}
                            onChange={(e) => updateVoucherCode(index, e.target.value)}
                            placeholder={`CODE${index + 1}`}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '0.375rem',
                              color: '#fff',
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
                              backgroundColor: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: field.checking || !field.code.trim() ? 'not-allowed' : 'pointer',
                              fontWeight: '600',
                              opacity: field.checking || !field.code.trim() ? 0.5 : 1,
                              fontSize: '0.8125rem',
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
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '0.375rem',
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
                          <p style={{ color: '#10b981', fontSize: '0.7rem', margin: 0 }}>
                            ✓ Gültig
                          </p>
                        )}
                        {field.valid === false && (
                          <p style={{ color: '#ef4444', fontSize: '0.7rem', margin: 0 }}>
                            ✗ Ungültig
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* ⭐ ADD BUTTON */}
                  {voucherFields.length < selectedSeats.length && (
                    <button
                      type="button"
                      onClick={addVoucherField}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px dashed rgba(16, 185, 129, 0.3)',
                        borderRadius: '0.375rem',
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
            </div>

            {/* Kontaktdaten */}
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '0.75rem',
              padding: isMobile ? '1rem' : '1.5rem',
              marginBottom: isMobile ? '1rem' : '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <User style={{ color: '#d4af37', width: '20px', height: '20px' }} />
                <h3 style={{ color: '#d4af37', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  Ihre Kontaktdaten
                </h3>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '1rem', 
                marginBottom: '1rem' 
              }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Vorname *
                  </label>
                  <input
                    type="text"
                    value={contactData.firstName}
                    onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Nachname *
                  </label>
                  <input
                    type="text"
                    value={contactData.lastName}
                    onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  E-Mail *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    width: '18px',
                    height: '18px',
                  }} />
                  <input
                    type="email"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.625rem 0.625rem 2.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <p style={{ 
                  color: '#999', 
                  fontSize: '0.75rem', 
                  marginTop: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  margin: '0.5rem 0 0 0',
                }}>
                  <Mail size={14} />
                  Die Tickets werden an diese E-Mail-Adresse gesendet.
                </p>
              </div>
            </div>

            {/* AGB & Datenschutz */}
            <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#fff', fontSize: '0.875rem' }}>
                  Ich akzeptiere die{' '}
                  <a href="/agb" target="_blank" style={{ color: '#d4af37', textDecoration: 'underline' }}>
                    AGB
                  </a>{' '}
                  *
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  required
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#fff', fontSize: '0.875rem' }}>
                  Ich akzeptiere die{' '}
                  <a href="/datenschutz" target="_blank" style={{ color: '#d4af37', textDecoration: 'underline' }}>
                    Datenschutzerklärung
                  </a>{' '}
                  *
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!agreedToTerms || !agreedToPrivacy}
              style={{
                width: '100%',
                padding: isMobile ? '0.875rem' : '1rem',
                background: agreedToTerms && agreedToPrivacy
                  ? 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)'
                  : '#555',
                border: 'none',
                borderRadius: '0.75rem',
                color: '#000',
                fontSize: isMobile ? '0.9375rem' : '1rem',
                fontWeight: '700',
                cursor: agreedToTerms && agreedToPrivacy ? 'pointer' : 'not-allowed',
              }}
            >
              {totalPrice === 0 
                ? 'Kostenlos reservieren' 
                : validVouchersCount > 0
                ? `${paidTickets} Ticket${paidTickets !== 1 ? 's' : ''} bezahlen (${totalPrice.toFixed(2)} €)`
                : `Zur Zahlung (${totalPrice.toFixed(2)} €)`
              }
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}