'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ReleaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  seatCount: number;
}

export default function ReleaseConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  seatCount,
}: ReleaseConfirmModalProps) {
  const [inputValue, setInputValue] = useState('');
  const isValid = inputValue.toUpperCase() === 'FREIGEBEN';

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setInputValue('');
      onClose();
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            {/* MODAL */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'rgba(20, 20, 20, 0.98)',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <AlertTriangle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                  </div>
                  <div>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      Sitzplatz freigeben?
                    </h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                      Diese Aktion kann nicht rückgängig gemacht werden
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X style={{ width: '24px', height: '24px' }} />
                </button>
              </div>

              {/* CONTENT */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>
                    Du bist dabei, <strong style={{ color: '#ef4444' }}>{seatCount} {seatCount === 1 ? 'Sitzplatz' : 'Sitzplätze'}</strong> freizugeben.
                  </p>
                </div>

                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                  Um fortzufahren, gib bitte <strong style={{ color: '#ef4444' }}>FREIGEBEN</strong> ein:
                </p>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="FREIGEBEN"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isValid) {
                      handleConfirm();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: `1px solid ${isValid ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    outline: 'none',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                  }}
                />

                {inputValue && !isValid && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>
                    Bitte gib exakt "FREIGEBEN" ein
                  </p>
                )}
              </div>

              {/* BUTTONS */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!isValid}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: isValid
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'rgba(239, 68, 68, 0.3)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: isValid ? 'pointer' : 'not-allowed',
                    opacity: isValid ? 1 : 0.5,
                  }}
                >
                  Freigeben
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}