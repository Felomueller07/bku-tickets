'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Trash2, BarChart3, Plus } from 'lucide-react';
import DeleteAllConfirmModal from './DeleteAllConfirmModal';

interface SeatData {
  row: string;
  number: number;
  firstName?: string;
  lastName?: string;
  note?: string;
}

interface AdminSidebarProps {
  selectedSeats: Array<{ row: string; number: number }>;
  occupiedSeats: SeatData[];
  isSeatOccupied: (row: string, number: number) => boolean;
  onReserve: () => void;
  onRelease: () => void;
  onReleaseAll: () => void;
  onSeatClick: (row: string, number: number) => void;
  onAddDataClick: (row: string, number: number) => void;
}

export default function AdminSidebar({
  selectedSeats,
  occupiedSeats,
  isSeatOccupied,
  onReserve,
  onRelease,
  onReleaseAll,
  onSeatClick,
  onAddDataClick,
}: AdminSidebarProps) {
  
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  
  const selectedFreeCount = selectedSeats.filter(s => !isSeatOccupied(s.row, s.number)).length;
  const selectedOccupiedCount = selectedSeats.filter(s => isSeatOccupied(s.row, s.number)).length;

  const getSeatDetails = (row: string, number: number) => {
    return occupiedSeats.find(s => s.row === row && s.number === number);
  };

  const hasSeatData = (row: string, number: number) => {
    const details = getSeatDetails(row, number);
    return details && (details.firstName || details.lastName || details.note);
  };

  const handleDeleteAllClick = () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmDeleteAll = () => {
    onReleaseAll();
    setConfirmModalOpen(false);
  };

  return (
    <>
      {/* CONFIRMATION MODAL */}
      <DeleteAllConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDeleteAll}
        seatCount={occupiedSeats.length}
      />

      <motion.div
        style={{
          width: '340px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          position: 'sticky',
          top: '2rem',
          maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            color: 'white', 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            margin: 0,
            letterSpacing: '-0.025em',
          }}>
            Verwaltung
          </h3>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.5)', 
            fontSize: '0.875rem', 
            margin: 0,
            marginTop: '0.25rem',
          }}>
            Administrator-Bereich
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* RESERVIEREN BUTTON */}
          {selectedFreeCount > 0 && (
            <motion.button
              onClick={onReserve}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              }}
            >
              <Lock style={{ width: '16px', height: '16px' }} />
              Reservieren ({selectedFreeCount})
            </motion.button>
          )}

          {/* FREIGEBEN BUTTON */}
          {selectedOccupiedCount > 0 && (
            <motion.button
              onClick={onRelease}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)',
              }}
            >
              <Check style={{ width: '16px', height: '16px' }} />
              Freigeben ({selectedOccupiedCount})
            </motion.button>
          )}
        </div>

        {/* STATISTIK */}
        <div style={{ 
          marginBottom: '2rem',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
          borderRadius: '1rem',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <BarChart3 style={{ width: '18px', height: '18px', color: '#d4af37' }} />
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Statistik
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '2rem', 
              color: '#d4af37', 
              fontWeight: '700',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {occupiedSeats.length}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              {occupiedSeats.length === 1 ? 'Reservierung' : 'Reservierungen'}
            </span>
          </div>
        </div>

        {/* AUSGEWÄHLTE SITZE */}
        {selectedSeats.length > 0 ? (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ 
              color: 'white', 
              fontSize: '0.9375rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              Ausgewählt
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.5)', 
                fontSize: '0.8125rem',
                fontWeight: '500',
              }}>
                ({selectedSeats.length})
              </span>
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedSeats.map(({ row, number }, index) => {
                const isOcc = isSeatOccupied(row, number);
                const hasData = hasSeatData(row, number);
                
                return (
                  <motion.div
                    key={`${row}${number}-${index}`}
                    style={{
                      backgroundColor: isOcc ? 'rgba(185, 28, 28, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                      border: `1px solid ${isOcc ? 'rgba(185, 28, 28, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`,
                      borderRadius: '0.75rem',
                      padding: '0.875rem 1rem',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span style={{ 
                      fontWeight: '600', 
                      fontSize: '1rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {row}{number}
                    </span>
                    
                    {/* DATEN BUTTON */}
                    {isOcc && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddDataClick(row, number);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '0.375rem 0.75rem',
                          background: hasData ? 'rgba(74, 222, 128, 0.2)' : 'rgba(212, 175, 55, 0.2)',
                          border: `1px solid ${hasData ? 'rgba(74, 222, 128, 0.4)' : 'rgba(212, 175, 55, 0.4)'}`,
                          borderRadius: '0.5rem',
                          color: hasData ? '#4ade80' : '#d4af37',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        {hasData ? (
                          <>
                            <Check style={{ width: '12px', height: '12px' }} />
                            Daten
                          </>
                        ) : (
                          <>
                            <Plus style={{ width: '12px', height: '12px' }} />
                            Daten
                          </>
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 'auto', textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.4)', 
              fontSize: '0.875rem',
              margin: 0,
            }}>
              Keine Sitze ausgewählt
            </p>
          </div>
        )}

        {/* DELETE ALL BUTTON - GANZ UNTEN */}
        {occupiedSeats.length > 0 && (
          <div style={{ 
            marginTop: 'auto', 
            paddingTop: '2rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <motion.button
              onClick={handleDeleteAllClick}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
              Alle {occupiedSeats.length} Reservierungen löschen
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
}