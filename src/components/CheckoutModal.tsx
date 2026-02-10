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
  
  // ⭐ COUNTDOWN TIMER STATE
  const [timeLeft, setTimeLeft] = useState(600); // 10 Minuten = 600 Sekunden
  
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

  // ⭐ COUNTDOWN TIMER LOGIC
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(600); // Reset bei schließen
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

  // ⭐ WARNUNG BEI 2 MINUTEN
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

  // ⭐ TIMER FORMATTING
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // ⭐ PROGRESS BAR PERCENTAGE
  const progressPercentage = (timeLeft / 600) * 100;
  
  // ⭐ TIMER COLOR (rot bei < 2 Min)
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
            maxWidth: isMobile ? '100%' : '800px',
            width: '100%',
            maxHeight: isMobile ? '90vh' : '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          {/* DRAG HANDLE - nur Mobile */}
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
            marginBottom: isMobile ? '1rem' : '1.5rem' 
          }}>
            <h2 style={{ 
              color: '#d4af37', 
              fontSize: isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: '700',
              margin: 0,
            }}>
              Checkout
            </h2>
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

          {/* ⭐ COUNTDOWN TIMER */}
          <motion.div
            animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
            transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
            style={{
              backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)',
              border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(212, 175, 55, 0.3)'}`,
              borderRadius: '0.75rem',
              padding: isMobile ? '1rem' : '1.25rem',
              marginBottom: isMobile ? '1rem' : '1.5rem',
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isUrgent ? (
                  <AlertCircle style={{ color: timerColor, width: '20px', height: '20px' }} />
                ) : (
                  <Clock style={{ color: timerColor, width: '20px', height: '20px' }} />
                )}
                <span style={{ 
                  color: timerColor, 
                  fontSize: isMobile ? '0.85rem' : '0.9rem',
                  fontWeight: '600',
                }}>
                  {isUrgent ? '⚠️ Bitte schnell abschließen!' : 'Noch verfügbar'}
                </span>
              </div>
              <span style={{ 
                color: timerColor, 
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: '700',
                fontFamily: 'monospace',
              }}>
                {timeString}
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
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
                  borderRadius: '4px',
                }}
              />
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
            {/* Ausgewählte Sitze */}
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '0.5rem',
              padding: isMobile ? '0.875rem' : '1rem',
              marginBottom: isMobile ? '1rem' : '1.5rem',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.5rem' 
              }}>
                <CreditCard style={{ color: '#d4af37', width: '20px', height: '20px' }} />
                <h3 style={{ 
                  color: '#d4af37', 
                  fontSize: isMobile ? '0.9rem' : '1rem', 
                  fontWeight: '600',
                  margin: 0,
                }}>
                  Ausgewählte Sitze
                </h3>
              </div>
              <p style={{ 
                color: '#fff', 
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                margin: '0.25rem 0',
              }}>
                Reihe {selectedSeats[0]?.row}, Platz {selectedSeats.map(s => s.number).join(', ')}
              </p>
              <p style={{ 
                color: '#d4af37', 
                fontSize: isMobile ? '1rem' : '1.125rem', 
                fontWeight: '700', 
                marginTop: '0.5rem',
                margin: '0.5rem 0 0 0',
              }}>
                {totalPrice.toFixed(2)} €
              </p>
              <p style={{ 
                color: '#999', 
                fontSize: isMobile ? '0.7rem' : '0.75rem', 
                marginTop: '0.25rem',
                margin: '0.25rem 0 0 0',
              }}>
                Josefi Konzert 2026
              </p>
            </div>

            {/* Freikartencode */}
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.5rem',
              padding: isMobile ? '0.875rem' : '1rem',
              marginBottom: isMobile ? '1rem' : '1.5rem',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.75rem' 
              }}>
                <Gift style={{ color: '#10b981', width: '20px', height: '20px' }} />
                <h3 style={{ 
                  color: '#10b981', 
                  fontSize: isMobile ? '0.9rem' : '1rem', 
                  fontWeight: '600',
                  margin: 0,
                }}>
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
                    padding: isMobile ? '0.675rem' : '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    textTransform: 'uppercase',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCheckVoucher}
                  disabled={voucherChecking || !voucherCode.trim()}
                  style={{
                    padding: isMobile ? '0.675rem 1rem' : '0.75rem 1.5rem',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: voucherChecking || !voucherCode.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: voucherChecking || !voucherCode.trim() ? 0.5 : 1,
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                  }}
                >
                  Prüfen
                </button>
              </div>
              {voucherValid === true && (
                <p style={{ 
                  color: '#10b981', 
                  fontSize: isMobile ? '0.8rem' : '0.875rem', 
                  marginTop: '0.5rem',
                  margin: '0.5rem 0 0 0',
                }}>
                  ✓ Code gültig! Freikarte aktiviert
                </p>
              )}
              {voucherValid === false && (
                <p style={{ 
                  color: '#ef4444', 
                  fontSize: isMobile ? '0.8rem' : '0.875rem', 
                  marginTop: '0.5rem',
                  margin: '0.5rem 0 0 0',
                }}>
                  ✗ Ungültiger Code
                </p>
              )}
            </div>

            {/* Kontaktdaten */}
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '0.5rem',
              padding: isMobile ? '1rem' : '1.5rem',
              marginBottom: isMobile ? '1rem' : '1.5rem',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '1rem' 
              }}>
                <User style={{ color: '#d4af37', width: '20px', height: '20px' }} />
                <h3 style={{ 
                  color: '#d4af37', 
                  fontSize: isMobile ? '0.9rem' : '1rem', 
                  fontWeight: '600',
                  margin: 0,
                }}>
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
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: isMobile ? '0.8rem' : '0.875rem', 
                    marginBottom: '0.5rem' 
                  }}>
                    Vorname *
                  </label>
                  <input
                    type="text"
                    value={contactData.firstName}
                    onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.675rem' : '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: isMobile ? '0.8rem' : '0.875rem', 
                    marginBottom: '0.5rem' 
                  }}>
                    Nachname *
                  </label>
                  <input
                    type="text"
                    value={contactData.lastName}
                    onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.675rem' : '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: isMobile ? '0.8rem' : '0.875rem', 
                  marginBottom: '0.5rem' 
                }}>
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
                      padding: isMobile ? '0.675rem 0.675rem 0.675rem 2.5rem' : '0.75rem 0.75rem 0.75rem 2.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <p style={{ 
                  color: '#999', 
                  fontSize: isMobile ? '0.7rem' : '0.75rem', 
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
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.75rem', 
                cursor: 'pointer' 
              }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ 
                  color: '#fff', 
                  fontSize: isMobile ? '0.8rem' : '0.875rem' 
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
                alignItems: 'center', 
                gap: '0.5rem', 
                cursor: 'pointer' 
              }}>
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  required
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ 
                  color: '#fff', 
                  fontSize: isMobile ? '0.8rem' : '0.875rem' 
                }}>
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
                borderRadius: '0.5rem',
                color: '#000',
                fontSize: isMobile ? '0.9rem' : '1rem',
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