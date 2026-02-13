'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Lock } from 'lucide-react';

interface DeleteAllConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  seatCount: number;
}

export default function DeleteAllConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  seatCount,
}: DeleteAllConfirmModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const CORRECT_PASSWORD = 'DELETE';

  const handleConfirm = () => {
    if (password !== CORRECT_PASSWORD) {
      setError('Falsches Bestätigungswort');
      return;
    }
    onConfirm();
    setPassword('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              backgroundColor: '#0a0a0a',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              maxWidth: '480px',
              width: '100%',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>

            {/* ICON */}
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}>
              <AlertCircle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
            </div>

            {/* HEADER */}
            <h3 style={{ 
              color: '#fff', 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              margin: 0, 
              marginBottom: '0.75rem',
              letterSpacing: '-0.025em',
            }}>
              Alle Reservierungen löschen
            </h3>
            
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '0.9375rem', 
              margin: 0, 
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}>
              {seatCount} {seatCount === 1 ? 'Reservierung' : 'Reservierungen'} werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            {/* INFO CARD */}
            <div style={{
              padding: '1rem 1.25rem',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{
                color: '#ef4444',
                fontSize: '1.5rem',
                fontWeight: '700',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {seatCount}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', fontWeight: '500' }}>
                  {seatCount === 1 ? 'Sitzplatz' : 'Sitzplätze'} werden gelöscht
                </div>
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.75rem',
              }}>
                <Lock style={{ width: '14px', height: '14px' }} />
                Bitte <span style={{ 
                  color: '#ef4444', 
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  fontSize: '0.9375rem',
                }}>{CORRECT_PASSWORD}</span> eingeben
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Bestätigungswort"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                }}
              />
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    color: '#ef4444', 
                    fontSize: '0.8125rem', 
                    marginTop: '0.5rem', 
                    margin: 0,
          
                  }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* BUTTONS */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                Abbrechen
              </motion.button>

              <motion.button
                onClick={handleConfirm}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                Löschen bestätigen
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}