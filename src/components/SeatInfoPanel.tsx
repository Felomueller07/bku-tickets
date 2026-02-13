'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2 } from 'lucide-react';

interface SeatInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  seatLabel: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  note?: string;
  createdAt?: string;
  reservedByUserId?: number;
  reservedByUser?: {
    id: number;
    email: string;
    name: string;
  };
  currentUserId?: number;
}

export default function SeatInfoPanel({
  isOpen,
  onClose,
  onEdit,
  seatLabel,
  firstName,
  lastName,
  email,
  note,
  createdAt,
  reservedByUserId,
  reservedByUser,
  currentUserId,
}: SeatInfoPanelProps) {
  
  const hasData = firstName || lastName || email;
  const canEdit = reservedByUserId === currentUserId || !reservedByUserId;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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

          <motion.div
            initial={{ opacity: 0, x: -100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -100, y: -20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '2rem',
              left: '2rem',
              width: '320px',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '1rem',
              padding: '1.25rem',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              boxShadow: '0 20px 60px rgba(239, 68, 68, 0.3)',
              zIndex: 1000,
            }}
          >
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}>
                  {seatLabel}
                </div>
                <div>
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                    Reserviert
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem', margin: 0 }}>
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
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* RESERVIERT VON - KOMPAKT */}
            {reservedByUser && (
              <div style={{
                marginBottom: '0.875rem',
                padding: '0.75rem',
                backgroundColor: canEdit ? 'rgba(212, 175, 55, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0.5rem',
                border: canEdit ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ 
                  color: canEdit ? '#d4af37' : '#3b82f6', 
                  fontSize: '0.8125rem', 
                  fontWeight: '600' 
                }}>
                  {canEdit ? '✅ Von dir reserviert' : `👤 Reserviert von: ${reservedByUser.name || reservedByUser.email}`}
                </span>
              </div>
            )}

            {/* DATEN - KOMPAKT UNTEREINANDER */}
            <div style={{ 
              marginBottom: '1rem',
              padding: '0.875rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ marginBottom: '0.625rem' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                  Vorname:
                </p>
                <p style={{ color: '#fff', fontSize: '0.9375rem', fontWeight: '600', margin: 0 }}>
                  {firstName || '—'}
                </p>
              </div>

              <div style={{ marginBottom: '0.625rem' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                  Nachname:
                </p>
                <p style={{ color: '#fff', fontSize: '0.9375rem', fontWeight: '600', margin: 0 }}>
                  {lastName || '—'}
                </p>
              </div>

              <div style={{ marginBottom: '0.625rem' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                  E-Mail / Telefon:
                </p>
                <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '500', margin: 0, wordBreak: 'break-all' }}>
                  {email || '—'}
                </p>
              </div>

              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                  Datum der Reservierung:
                </p>
                <p style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                  {formatDate(createdAt)}
                </p>
              </div>
            </div>

            {/* EDIT BUTTON oder NUR ANSEHEN */}
            {canEdit ? (
              <motion.button
                onClick={onEdit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Edit2 style={{ width: '14px', height: '14px' }} />
                {hasData ? 'Daten bearbeiten' : 'Daten hinzufügen'}
              </motion.button>
            ) : (
              <div style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: '#3b82f6',
                textAlign: 'center',
              }}>
                🔒 Nur ansehen (von User reserviert)
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
