'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Trash2, BarChart3, Plus, User, Mail, Calendar, Info } from 'lucide-react';
import DeleteAllConfirmModal from './DeleteAllConfirmModal';
import FreeTicketGenerator from './FreeTicketGenerator';

interface SeatData {
  row: string;
  number: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
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
    const seat = getSeatDetails(row, number);
    return seat && (seat.firstName || seat.lastName || seat.note);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div style={{
        width: '400px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(212, 175, 55, 0.3)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* HEADER */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Lock style={{ width: '24px', height: '24px', color: '#d4af37' }} />
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              Admin Panel
            </h2>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', margin: 0 }}>
            {selectedSeats.length} {selectedSeats.length === 1 ? 'Sitzplatz' : 'Sitzplätze'} ausgewählt
          </p>
        </div>

        {/* STATISTIK */}
        <div style={{
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <BarChart3 style={{ width: '18px', height: '18px', color: '#d4af37' }} />
            <h3 style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
              Statistik
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Gesamt belegt:</span>
              <span style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '600' }}>{occupiedSeats.length}</span>
            </div>
            {selectedSeats.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Ausgewählt frei:</span>
                  <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>{selectedFreeCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Ausgewählt belegt:</span>
                  <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '600' }}>{selectedOccupiedCount}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* AUSGEWÄHLTE SITZE */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {selectedSeats.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
            }}>
              <Lock style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>Keine Sitzplätze ausgewählt</p>
            </div>
          ) : (
            selectedSeats.map((seat) => {
              const isOccupied = isSeatOccupied(seat.row, seat.number);
              const details = getSeatDetails(seat.row, seat.number);
              const hasData = hasSeatData(seat.row, seat.number);

              return (
                <motion.div
                  key={`${seat.row}-${seat.number}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    backgroundColor: isOccupied
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    border: isOccupied
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        color: 'white',
                        fontWeight: '600',
                        margin: '0 0 0.25rem 0',
                        fontSize: '1rem'
                      }}>
                        Reihe {seat.row}, Platz {seat.number}
                      </p>
                      {isOccupied && details && (
                        <div style={{ marginTop: '0.5rem' }}>
                          {(details.firstName || details.lastName) && (
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '0.875rem',
                              margin: '0 0 0.25rem 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <User style={{ width: '14px', height: '14px' }} />
                              {details.firstName} {details.lastName}
                            </p>
                          )}
                          {details.email && (
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.75rem',
                              margin: '0 0 0.25rem 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <Mail style={{ width: '14px', height: '14px' }} />
                              {details.email}
                            </p>
                          )}
                          {details.createdAt && (
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.75rem',
                              margin: '0.25rem 0 0 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <Calendar style={{ width: '14px', height: '14px' }} />
                              {formatDate(details.createdAt)}
                            </p>
                          )}
                          {details.note && (
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.75rem',
                              margin: '0.5rem 0 0 0',
                              fontStyle: 'italic'
                            }}>
                              "{details.note}"
                            </p>
                          )}
                        </div>
                      )}
                      <p style={{
                        color: isOccupied ? '#ef4444' : '#10b981',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        margin: '0.5rem 0 0 0'
                      }}>
                        {isOccupied ? 'Belegt' : 'Frei'}
                      </p>
                    </div>
                    {isOccupied && !hasData && (
                      <button
                        onClick={() => onAddDataClick(seat.row, seat.number)}
                        style={{
                          background: 'rgba(212, 175, 55, 0.2)',
                          border: '1px solid rgba(212, 175, 55, 0.5)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Plus style={{ width: '16px', height: '16px', color: '#d4af37' }} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* ACTIONS */}
        {selectedSeats.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedFreeCount > 0 && (
              <button
                onClick={onReserve}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Check style={{ width: '18px', height: '18px' }} />
                Reservieren ({selectedFreeCount})
              </button>
            )}

            {selectedOccupiedCount > 0 && (
              <button
                onClick={onRelease}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '0.5rem',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Trash2 style={{ width: '18px', height: '18px' }} />
                Freigeben ({selectedOccupiedCount})
              </button>
            )}
          </div>
        )}

        {/* ALLE FREIGEBEN */}
        {occupiedSeats.length > 0 && (
          <button
            onClick={() => setConfirmModalOpen(true)}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              color: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Trash2 style={{ width: '18px', height: '18px' }} />
            Alle Reservierungen löschen ({occupiedSeats.length})
          </button>
        )}

        {/* FREIKARTEN GENERATOR */}
        <FreeTicketGenerator />

        {/* INFO BOX UNTEN RECHTS */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginTop: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Info style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
            <h3 style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
              Info
            </h3>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', margin: 0, lineHeight: '1.5' }}>
            Wähle Sitzplätze aus um Details wie Name, E-Mail und Reservierungsdatum anzuzeigen.
          </p>
        </div>
      </div>

      {/* MODALS */}
      <DeleteAllConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          onReleaseAll();
          setConfirmModalOpen(false);
        }}
        seatCount={occupiedSeats.length}
      />
    </>
  );
}
