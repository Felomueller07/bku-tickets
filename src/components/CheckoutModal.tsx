'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Mail, User, Gift, Clock, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Array<{ row: string; number: number }>;
  onCheckout: (seats: any[], voucherCode?: string) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedSeats,
  onCheckout,
}: CheckoutModalProps) {
  const { data: session } = useSession();
  
  const [timeLeft, setTimeLeft] = useState(600);
  
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null);
  const [voucherChecking, setVoucherChecking] = useState(false);
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
    } catch (error) {
      setVoucherValid(false);
    } finally {
      setVoucherChecking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const seatsWithData = seatData.map((seat) => ({
      row: seat.row,
      number: seat.number,
      firstName: seat.firstName || contactData.firstName,
      lastName: seat.lastName || contactData.lastName,
      email: contactData.email,
      voucherCode: voucherValid ? voucherCode : undefined,
    }));

    onCheckout(seatsWithData, voucherValid ? voucherCode : undefined);
  };

  const totalPrice = voucherValid ? 0 : selectedSeats.length * 20;

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
            padding: isMobile ? '1.25rem' : '1.5rem',
            maxWidth: isMobile ? '100%' : '700px',
            width: '100%',
            maxHeight: isMobile ? '90vh' : '85vh',
            overflowY: 'auto',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          {/* DRAG HANDLE - nur Mobile */}
          {isMobile && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '0.75rem',
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

          {/* HEADER + TIMER IN EINER ZEILE */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: isMobile ? '0.75rem' : '1rem',
            gap: '1rem',
          }}>
            <h2 style={{ 
              color: '#d4af37', 
              fontSize: isMobile ? '1.125rem' : '1.25rem', 
              fontWeight: '700',
              margin: 0,
            }}>
              Checkout
            </h2>

            {/* ⭐ TIMER KOMPAKT - RECHTS */}
            <motion.div
              animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
              transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(212, 175, 55, 0.3)'}`,
                borderRadius: '0.5rem',
              }}
            >
              {isUrgent ? (
                <AlertCircle style={{ color: timerColor, width: '16px', height: '16px' }} />
              ) : (
                <Clock style={{ color: timerColor, width: '16px', height: '16px' }} />
              )}
              <span style={{ 
                color: timerColor, 
                fontSize: isMobile ? '1rem' : '1.125rem',
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
                padding: '0.25rem',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* PROGRESS BAR - DÜNN */}
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: isMobile ? '0.75rem' : '1rem',
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
                borderRadius: '2px',
              }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            {/* ⭐ SITZE + PREIS + VOUCHER IN 2 SPALTEN (Desktop) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '0.75rem' : '1rem',
              marginBottom: isMobile ? '0.75rem' : '1rem',
            }}>
              {/* Ausgewählte Sitze - KOMPAKT */}
              <div style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '0.5rem',
                padding: isMobile ? '0.75rem' : '0.875rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CreditCard style={{ color: '#d4af37', width: '16px', height: '16px' }} />
                  <h3 style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                    Ausgewählte Sitze
                  </h3>
                </div>
                <p style={{ color: '#fff', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>
                  Reihe {selectedSeats[0]?.row}, Platz {selectedSeats.map(s => s.number).join(', ')}
                </p>
                <p style={{ color: '#d4af37', fontSize: '1rem', fontWeight: '700', margin: 0 }}>
                  {totalPrice.toFixed(2)} €
                </p>
              </div>

              {/* Freikartencode - KOMPAKT */}
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.5rem',
                padding: isMobile ? '0.75rem' : '0.875rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Gift style={{ color: '#10b981', width: '16px', height: '16px' }} />
                  <h3 style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                    Freikarten-Code
                  </h3>
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
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.375rem',
                      color: '#fff',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCheckVoucher}
                    disabled={voucherChecking || !voucherCode.trim()}
                    style={{
                      padding: '0.5rem 0.875rem',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: voucherChecking || !voucherCode.trim() ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      opacity: voucherChecking || !voucherCode.trim() ? 0.5 : 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    Prüfen
                  </button>
                </div>
                {voucherValid === true && (
                  <p style={{ color: '#10b981', fontSize: '0.7rem', margin: '0.375rem 0 0 0' }}>
                    ✓ Code gültig!
                  </p>
                )}
                {voucherValid === false && (
                  <p style={{ color: '#ef4444', fontSize: '0.7rem', margin: '0.375rem 0 0 0' }}>
                    ✗ Ungültig
                  </p>
                )}
              </div>
            </div>

            {/* Kontaktdaten - KOMPAKT */}
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '0.5rem',
              padding: isMobile ? '0.75rem' : '1rem',
              marginBottom: isMobile ? '0.75rem' : '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <User style={{ color: '#d4af37', width: '16px', height: '16px' }} />
                <h3 style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                  Ihre Kontaktdaten
                </h3>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '0.75rem', 
                marginBottom: '0.75rem' 
              }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                    Vorname *
                  </label>
                  <input
                    type="text"
                    value={contactData.firstName}
                    onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.375rem',
                      color: '#fff',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                    Nachname *
                  </label>
                  <input
                    type="text"
                    value={contactData.lastName}
                    onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.375rem',
                      color: '#fff',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                  E-Mail *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute',
                    left: '0.625rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    width: '16px',
                    height: '16px',
                  }} />
                  <input
                    type="email"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.375rem',
                      color: '#fff',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <p style={{ 
                  color: '#999', 
                  fontSize: '0.7rem', 
                  marginTop: '0.375rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.375rem',
                  margin: '0.375rem 0 0 0',
                }}>
                  <Mail size={12} />
                  Die Tickets werden an diese E-Mail-Adresse gesendet.
                </p>
              </div>
            </div>

            {/* AGB & Datenschutz - KOMPAKT */}
            <div style={{ marginBottom: isMobile ? '0.75rem' : '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ color: '#fff', fontSize: '0.8125rem' }}>
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
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ color: '#fff', fontSize: '0.8125rem' }}>
                  Ich akzeptiere die{' '}
                  <a href="/datenschutz" target="_blank" style={{ color: '#d4af37', textDecoration: 'underline' }}>
                    Datenschutzerklärung
                  </a>{' '}
                  *
                </span>
              </label>
            </div>

            {/* Submit Button - KOMPAKT */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!agreedToTerms || !agreedToPrivacy}
              style={{
                width: '100%',
                padding: isMobile ? '0.75rem' : '0.875rem',
                background: agreedToTerms && agreedToPrivacy
                  ? 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)'
                  : '#555',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#000',
                fontSize: isMobile ? '0.875rem' : '0.9375rem',
                fontWeight: '700',
                cursor: agreedToTerms && agreedToPrivacy ? 'pointer' : 'not-allowed',
              }}
            >
              {voucherValid ? 'Kostenlos reservieren' : `Zur Zahlung (${totalPrice.toFixed(2)} €)`}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}