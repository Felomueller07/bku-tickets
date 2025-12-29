'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, User, FileText } from 'lucide-react';

interface SeatInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  seatLabel: string;
  firstName?: string;
  lastName?: string;
  note?: string;
}

export default function SeatInfoPanel({
  isOpen,
  onClose,
  onEdit,
  seatLabel,
  firstName,
  lastName,
  note,
}: SeatInfoPanelProps) {
  
  const hasData = firstName || lastName || note;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* UNSICHTBARER BACKDROP - CLICK SCHLIEßT DAS PANEL */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
            }}
          />

          {/* INFO PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 100, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()} // Verhindert dass Click auf Panel den Backdrop triggert
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '350px',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              boxShadow: '0 20px 60px rgba(239, 68, 68, 0.3)',
              zIndex: 1000,
            }}
          >
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}>
                  {seatLabel}
                </div>
                <div>
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                    Reserviert
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', margin: 0 }}>
                    Sitzplatz
                  </p>
                </div>
              </div>
              
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
                  borderRadius: '0.375rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* DATEN */}
            {hasData ? (
              <div style={{ 
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                {(firstName || lastName) && (
                  <div style={{ marginBottom: note ? '0.75rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <User style={{ width: '14px', height: '14px', color: '#d4af37' }} />
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', fontWeight: '500' }}>
                        Name
                      </span>
                    </div>
                    <p style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                      {firstName} {lastName}
                    </p>
                  </div>
                )}
                
                {note && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <FileText style={{ width: '14px', height: '14px', color: '#d4af37' }} />
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', fontWeight: '500' }}>
                        Notiz
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>
                      {note}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                textAlign: 'center',
              }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', margin: 0 }}>
                  Keine Daten hinterlegt
                </p>
              </div>
            )}

            {/* EDIT BUTTON */}
            <motion.button
              onClick={onEdit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Edit2 style={{ width: '16px', height: '16px' }} />
              {hasData ? 'Daten bearbeiten' : 'Daten hinzufügen'}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}