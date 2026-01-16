'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Mail, User, Gift } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Array<{ row: string; number: number }>;
  onCheckout: (seats: any[]) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedSeats,
  onCheckout,
}: CheckoutModalProps) {
  const { data: session } = useSession();
  
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null);
  const [voucherChecking, setVoucherChecking] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

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

  // ⭐ AUTO-FILL mit Session-Daten
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      console.log('👤 Session User:', user);
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      console.log('👤 Session User:', user);
      
      // FALLBACK: Wenn firstName/lastName nicht existieren, name splitten
      let firstName = user.firstName || '';
      let lastName = user.lastName || '';
      
      if (!firstName && user.name) {
        const nameParts = user.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      setContactData({
        firstName: firstName,
        lastName: lastName,
        email: user.email || '',
      });
    }
  }, [session]);
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

    console.log('📋 Submit - selectedSeats:', selectedSeats);
    console.log('📋 Submit - seatData:', seatData);
    console.log('📋 Submit - contactData:', contactData);

    const seatsWithData = seatData.map((seat) => ({
      row: seat.row,
      number: seat.number,
      firstName: seat.firstName || contactData.firstName,
      lastName: seat.lastName || contactData.lastName,
      email: contactData.email,
    }));

    console.log('📋 Submit - seatsWithData:', seatsWithData);

    onCheckout(seatsWithData);
  };

  const totalPrice = voucherValid ? 0 : selectedSeats.length * 20;

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
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '700' }}>
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

          <form onSubmit={handleSubmit}>
            {/* Ausgewählte Sitze */}
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CreditCard style={{ color: '#d4af37', width: '20px', height: '20px' }} />
                <h3 style={{ color: '#d4af37', fontSize: '1rem', fontWeight: '600' }}>
                  Ausgewählte Sitze
                </h3>
              </div>
              <p style={{ color: '#fff', fontSize: '0.875rem' }}>
                Reihe {selectedSeats[0]?.row}, Platz {selectedSeats.map(s => s.number).join(', ')}
              </p>
              <p style={{ color: '#d4af37', fontSize: '1.125rem', fontWeight: '700', marginTop: '0.5rem' }}>
                {totalPrice.toFixed(2)} €
              </p>
              <p style={{ color: '#999', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Josefi Konzert 2026
              </p>
            </div>

            {/* Freikartencode */}
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Gift style={{ color: '#10b981', width: '20px', height: '20px' }} />
                <h3 style={{ color: '#10b981', fontSize: '1rem', fontWeight: '600' }}>
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
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
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
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: voucherChecking || !voucherCode.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: voucherChecking || !voucherCode.trim() ? 0.5 : 1,
                  }}
                >
                  Prüfen
                </button>
              </div>
              {voucherValid === true && (
                <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  ✓ Code gültig! Freikarte aktiviert
                </p>
              )}
              {voucherValid === false && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  ✗ Ungültiger Code
                </p>
              )}
            </div>

            {/* Kontaktdaten */}
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <User style={{ color: '#d4af37', width: '20px', height: '20px' }} />
                <h3 style={{ color: '#d4af37', fontSize: '1rem', fontWeight: '600' }}>
                  Ihre Kontaktdaten
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
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
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
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
                      padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <p style={{ color: '#999', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} />
                  Die Tickets werden an diese E-Mail-Adresse gesendet.
                </p>
              </div>
            </div>

            {/* AGB & Datenschutz */}
            <div style={{ marginBottom: '1.5rem' }}>
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
                padding: '1rem',
                background: agreedToTerms && agreedToPrivacy
                  ? 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)'
                  : '#555',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#000',
                fontSize: '1rem',
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
