'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Gift, Clock, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Array<{ row: string; number: number }>;
  onCheckout: (seats: any[], voucherCodes?: string[]) => void;
  sessionId: string;
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
  sessionId,
}: CheckoutModalProps) {
  const { data: session } = useSession();
  
  const [timeLeft, setTimeLeft] = useState(600);
  const [voucherFields, setVoucherFields] = useState<VoucherField[]>([
    { code: '', valid: null, checking: false }
  ]);
  const [showVouchers, setShowVouchers] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [contactData, setContactData] = useState({ firstName: '', lastName: '', email: '' });

  // TIMER
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(600);
      setVoucherFields([{ code: '', valid: null, checking: false }]);
      setAgreedToTerms(false);
      setAgreedToPrivacy(false);
      setShowVouchers(false);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error('⚠️ Zeit abgelaufen! Sitze wurden freigegeben.');
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (timeLeft === 120) toast.warning('⚠️ Nur noch 2 Minuten!');
  }, [timeLeft]);

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

  const handleClose = async () => {
    try {
      await fetch('/api/seats/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (e) {}
    onClose();
  };

  // VOUCHER
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
    const f = [...voucherFields];
    f[index] = { code: code.toUpperCase(), valid: null, checking: false };
    setVoucherFields(f);
  };

  const handleCheckVoucher = async (index: number) => {
    const code = voucherFields[index].code.trim();
    if (!code) return;

    const isDuplicate = voucherFields.some((v, i) =>
      i !== index && v.code.toUpperCase() === code.toUpperCase() && v.valid === true
    );
    if (isDuplicate) { toast.error('Dieser Code wurde bereits verwendet'); return; }

    const f = [...voucherFields];
    f[index] = { ...f[index], checking: true };
    setVoucherFields(f);

    try {
      const res = await fetch('/api/voucher/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      f[index] = { code: f[index].code, valid: data.valid, checking: false };
      setVoucherFields([...f]);
      if (data.valid) toast.success('✓ Gutschein gültig');
      else toast.error('✗ Ungültiger Gutschein');
    } catch {
      f[index] = { code: f[index].code, valid: false, checking: false };
      setVoucherFields([...f]);
    }
  };

  const validVouchersCount = voucherFields.filter(v => v.valid === true).length;
  const paidTickets = Math.max(0, selectedSeats.length - validVouchersCount);
  const totalPrice = paidTickets * 20;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isUrgent = timeLeft < 120;
  const timerColor = isUrgent ? '#ef4444' : '#d4af37';
  const progress = (timeLeft / 600) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.firstName.trim() || !contactData.lastName.trim() || !contactData.email.trim()) {
      toast.error('Bitte alle Felder ausfüllen'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      toast.error('Bitte gültige E-Mail eingeben'); return;
    }
    const seatsWithData = selectedSeats.map(seat => ({
      row: seat.row,
      number: seat.number,
      firstName: contactData.firstName.trim(),
      lastName: contactData.lastName.trim(),
      email: contactData.email.trim(),
    }));
    const validVouchers = voucherFields.filter(v => v.valid === true && v.code.trim()).map(v => v.code.trim());
    onCheckout(seatsWithData, validVouchers.length > 0 ? validVouchers : undefined);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9000,
        }}
      />

      {/* MODAL - BOTTOM SHEET ON MOBILE, CENTER ON DESKTOP */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '92vh',
          backgroundColor: '#111',
          borderRadius: '20px 20px 0 0',
          zIndex: 9001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          // Desktop: center
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {/* ⭐ STICKY HEADER - IMMER SICHTBAR */}
        <div style={{
          flexShrink: 0,
          backgroundColor: '#111',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* DRAG HANDLE */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
            <div style={{ width: '36px', height: '4px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '2px' }} />
          </div>

          {/* TIMER + TITLE ROW */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px 12px',
          }}>
            <div>
              <div style={{ color: 'white', fontSize: '18px', fontWeight: '700', lineHeight: 1.2 }}>
                Checkout
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>
                {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} · {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}
              </div>
            </div>

            {/* TIMER BADGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <motion.div
                animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                transition={isUrgent ? { repeat: Infinity, duration: 1 } : {}}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.15)',
                  border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : 'rgba(212,175,55,0.4)'}`,
                  borderRadius: '10px',
                  padding: '6px 12px',
                }}
              >
                {isUrgent
                  ? <AlertCircle style={{ width: '14px', height: '14px', color: timerColor }} />
                  : <Clock style={{ width: '14px', height: '14px', color: timerColor }} />
                }
                <span style={{ color: timerColor, fontSize: '16px', fontWeight: '700', fontFamily: 'monospace' }}>
                  {timeString}
                </span>
              </motion.div>

              <button
                onClick={handleClose}
                style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
              </button>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={{
            height: '3px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            marginBottom: '0',
          }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              style={{
                height: '100%',
                background: isUrgent
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : 'linear-gradient(90deg, #d4af37, #f4e7c3)',
                borderRadius: '0 2px 2px 0',
              }}
            />
          </div>
        </div>

        {/* ⭐ SCROLLBARER INHALT */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* VORNAME + NACHNAME NEBENEINANDER */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Vorname *
              </label>
              <input
                type="text"
                value={contactData.firstName}
                onChange={e => setContactData({ ...contactData, firstName: e.target.value })}
                placeholder="Max"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Nachname *
              </label>
              <input
                type="text"
                value={contactData.lastName}
                onChange={e => setContactData({ ...contactData, lastName: e.target.value })}
                placeholder="Mustermann"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none',
                }}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              E-Mail *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '16px', height: '16px', color: 'rgba(255,255,255,0.4)',
              }} />
              <input
                type="email"
                value={contactData.email}
                onChange={e => setContactData({ ...contactData, email: e.target.value })}
                placeholder="max@beispiel.de"
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 38px',
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none',
                }}
              />
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '5px', paddingLeft: '4px' }}>
              Tickets werden an diese Adresse gesendet
            </div>
          </div>

          {/* GUTSCHEIN - COLLAPSIBLE */}
          <div style={{
            backgroundColor: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '14px',
            flexShrink: 0,
          }}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowVouchers(!showVouchers)}
              onKeyDown={e => e.key === 'Enter' && setShowVouchers(!showVouchers)}
              style={{
                width: '100%',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift style={{ width: '16px', height: '16px', color: '#10b981' }} />
                <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
                  Freikarten-Code
                </span>
                {validVouchersCount > 0 && (
                  <span style={{
                    backgroundColor: '#10b981',
                    color: '#000',
                    borderRadius: '20px',
                    padding: '1px 8px',
                    fontSize: '11px',
                    fontWeight: '700',
                  }}>
                    {validVouchersCount} aktiv
                  </span>
                )}
              </div>
              {showVouchers
                ? <ChevronUp style={{ width: '16px', height: '16px', color: '#10b981' }} />
                : <ChevronDown style={{ width: '16px', height: '16px', color: '#10b981' }} />
              }
            </div>

            {showVouchers && (
              <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {voucherFields.map((field, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={field.code}
                        onChange={e => updateVoucherCode(index, e.target.value)}
                        placeholder={`CODE ${index + 1}`}
                        style={{
                          flex: 1,
                          padding: '11px 12px',
                          backgroundColor: 'rgba(255,255,255,0.07)',
                          border: `1px solid ${field.valid === true ? 'rgba(16,185,129,0.5)' : field.valid === false ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '14px',
                          textTransform: 'uppercase',
                          outline: 'none',
                          letterSpacing: '1px',
                          WebkitAppearance: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleCheckVoucher(index)}
                        disabled={field.checking || !field.code.trim()}
                        style={{
                          padding: '11px 14px',
                          backgroundColor: field.checking || !field.code.trim() ? 'rgba(16,185,129,0.3)' : '#10b981',
                          border: 'none',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: field.checking || !field.code.trim() ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {field.checking ? '...' : 'Prüfen'}
                      </button>
                      {voucherFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVoucherField(index)}
                          style={{
                            width: '40px',
                            backgroundColor: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                        </button>
                      )}
                    </div>
                    {field.valid === true && (
                      <div style={{ color: '#10b981', fontSize: '12px', marginTop: '4px', paddingLeft: '4px' }}>✓ Gültig – 1 Ticket kostenlos</div>
                    )}
                    {field.valid === false && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', paddingLeft: '4px' }}>✗ Ungültiger Code</div>
                    )}
                  </div>
                ))}

                {voucherFields.length < selectedSeats.length && (
                  <button
                    type="button"
                    onClick={addVoucherField}
                    style={{
                      padding: '10px',
                      backgroundColor: 'rgba(16,185,129,0.1)',
                      border: '1px dashed rgba(16,185,129,0.3)',
                      borderRadius: '10px',
                      color: '#10b981',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Plus style={{ width: '14px', height: '14px' }} />
                    Weiteren Code hinzufügen
                  </button>
                )}
              </div>
            )}
          </div>

          {/* PREIS ÜBERSICHT */}
          <div style={{
            backgroundColor: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '14px',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: validVouchersCount > 0 ? '8px' : '0' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                {selectedSeats.length} × Ticket à 20,00 €
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                {(selectedSeats.length * 20).toFixed(2)} €
              </span>
            </div>
            {validVouchersCount > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#10b981', fontSize: '14px' }}>
                    {validVouchersCount} × Freikarte
                  </span>
                  <span style={{ color: '#10b981', fontSize: '14px' }}>
                    −{(validVouchersCount * 20).toFixed(2)} €
                  </span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: '8px' }} />
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Gesamt</span>
              <span style={{ color: '#d4af37', fontSize: '22px', fontWeight: '800' }}>
                {totalPrice.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* AGB */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                style={{
                  width: '22px', height: '22px', flexShrink: 0,
                  borderRadius: '6px',
                  border: `2px solid ${agreedToTerms ? '#d4af37' : 'rgba(255,255,255,0.25)'}`,
                  backgroundColor: agreedToTerms ? '#d4af37' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {agreedToTerms && <span style={{ color: '#000', fontSize: '13px', fontWeight: '900' }}>✓</span>}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.4 }}>
                Ich akzeptiere die{' '}
                <a href="/agb" target="_blank" style={{ color: '#d4af37', textDecoration: 'underline' }}>AGB</a>
                {' '}*
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div
                onClick={() => setAgreedToPrivacy(!agreedToPrivacy)}
                style={{
                  width: '22px', height: '22px', flexShrink: 0,
                  borderRadius: '6px',
                  border: `2px solid ${agreedToPrivacy ? '#d4af37' : 'rgba(255,255,255,0.25)'}`,
                  backgroundColor: agreedToPrivacy ? '#d4af37' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {agreedToPrivacy && <span style={{ color: '#000', fontSize: '13px', fontWeight: '900' }}>✓</span>}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.4 }}>
                Ich akzeptiere die{' '}
                <a href="/datenschutz" target="_blank" style={{ color: '#d4af37', textDecoration: 'underline' }}>Datenschutzerklärung</a>
                {' '}*
              </span>
            </label>
          </div>

          {/* SPACER für sticky footer */}
          <div style={{ height: '16px', flexShrink: 0 }} />
        </form>

        {/* ⭐ STICKY FOOTER - SUBMIT BUTTON IMMER SICHTBAR */}
        <div style={{
          flexShrink: 0,
          padding: '12px 16px',
          backgroundColor: '#111',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (!contactData.firstName.trim() || !contactData.lastName.trim() || !contactData.email.trim()) {
                toast.error('Bitte alle Felder ausfüllen'); return;
              }
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
                toast.error('Bitte gültige E-Mail eingeben'); return;
              }
              if (!agreedToTerms || !agreedToPrivacy) {
                toast.error('Bitte AGB und Datenschutz akzeptieren'); return;
              }
              const seatsWithData = selectedSeats.map(seat => ({
                row: seat.row, number: seat.number,
                firstName: contactData.firstName.trim(),
                lastName: contactData.lastName.trim(),
                email: contactData.email.trim(),
              }));
              const validVouchers = voucherFields.filter(v => v.valid === true && v.code.trim()).map(v => v.code.trim());
              onCheckout(seatsWithData, validVouchers.length > 0 ? validVouchers : undefined);
            }}
            disabled={!agreedToTerms || !agreedToPrivacy}
            style={{
              width: '100%',
              padding: '16px',
              background: agreedToTerms && agreedToPrivacy
                ? 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)'
                : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '14px',
              color: agreedToTerms && agreedToPrivacy ? '#000' : 'rgba(255,255,255,0.3)',
              fontSize: '16px',
              fontWeight: '800',
              cursor: agreedToTerms && agreedToPrivacy ? 'pointer' : 'not-allowed',
              boxShadow: agreedToTerms && agreedToPrivacy ? '0 4px 20px rgba(212,175,55,0.3)' : 'none',
              letterSpacing: '0.3px',
            }}
          >
            {totalPrice === 0
              ? 'Kostenlos reservieren'
              : validVouchersCount > 0
                ? `Jetzt bezahlen · ${totalPrice.toFixed(2)} €`
                : `Zur Zahlung · ${totalPrice.toFixed(2)} €`
            }
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}