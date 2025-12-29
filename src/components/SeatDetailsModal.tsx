'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, FileText } from 'lucide-react';

interface SeatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { firstName: string; lastName: string; note: string; applyToAll: boolean }) => void;
  initialData?: { firstName?: string; lastName?: string; note?: string };
  seatLabel: string;
  hasMultipleSeats?: boolean;
}

export default function SeatDetailsModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  seatLabel,
  hasMultipleSeats = false,
}: SeatDetailsModalProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [applyToAll, setApplyToAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFirstName(initialData?.firstName || '');
      setLastName(initialData?.lastName || '');
      setNote(initialData?.note || '');
      setApplyToAll(false);
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave({ firstName, lastName, note, applyToAll });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: 'bold' }}>
                Sitz {seatLabel}
              </h3>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
              >
                <X style={{ width: '24px', height: '24px' }} />
              </button>
            </div>

            {/* FORM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* VORNAME */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  <User style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.5rem' }} />
                  Vorname
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="z.B. Max"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d4af37';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                />
              </div>

              {/* NACHNAME */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  <User style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.5rem' }} />
                  Nachname
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="z.B. Mustermann"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d4af37';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                />
              </div>

              {/* NOTIZ */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  <FileText style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.5rem' }} />
                  Notiz (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="z.B. Telefonnummer, Bemerkungen..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d4af37';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                />
              </div>

              {/* AUF ALLE ANWENDEN CHECKBOX */}
              {hasMultipleSeats && (
                <div 
                  onClick={() => setApplyToAll(!applyToAll)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '0.25rem',
                    border: '2px solid #d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: applyToAll ? '#d4af37' : 'transparent',
                    transition: 'all 0.2s',
                  }}>
                    {applyToAll && (
                      <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                    )}
                  </div>
                  <span style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '500' }}>
                    Daten auf alle ausgewählten Sitze anwenden
                  </span>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Abbrechen
              </motion.button>

              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Speichern
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}