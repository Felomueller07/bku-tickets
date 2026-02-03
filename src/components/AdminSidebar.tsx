'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Trash2, BarChart3, Plus, User, Mail, Calendar, Info, Bookmark } from 'lucide-react';
import DeleteAllConfirmModal from './DeleteAllConfirmModal';

interface SeatData {
  row: string;
  number: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  reservationType?: string | null;
}

interface AdminSidebarProps {
  selectedSeats: Array<{ row: string; number: number }>;
  occupiedSeats: SeatData[];
  isSeatOccupied: (row: string, number: number) => boolean;
  onReserve: () => void;
  onRelease: () => void;
  onReleaseAll: () => void;
  onMark: () => void; 
  onSeatClick: (row: string, number: number) => void;
  onAddDataClick: (row: string, number: number) => void;
  isMobile?: boolean;
}

export default function AdminSidebar({
  selectedSeats,
  occupiedSeats,
  isSeatOccupied,
  onReserve,
  onRelease,
  onReleaseAll,
  onMark,
  onSeatClick,
  onAddDataClick,
  isMobile = false,
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
        width: isMobile ? '100%' : '400px',
        backgroundColor: isMobile ? 'transparent' : 'rgba(0, 0, 0, 0.9)',
        backdropFilter: isMobile ? 'none' : 'blur(20px)',
        borderLeft: isMobile ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
        padding: isMobile ? '0' : '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '1rem' : '1.5rem',
        height: isMobile ? 'auto' : '100vh',
        overflowY: 'auto',
      }}>
        {/* HEADER */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Lock style={{ width: '24px', height: '24px', color: '#d4af37' }} />
            <h2 style={{ color: 'white', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '700', margin: 0 }}>
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
          padding: isMobile ? '0.875rem' : '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <BarChart3 style={{ width: '18px', height: '18px', color: '#d4af37' }} />
            <h3 style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
              Statistik
            </h3>
          </div>
          
          {(() => {
            // GESAMTANZAHL SITZE - Ändere diese Zahl falls nötig!
            const totalSeats = 751;
            
            // BERECHNE STATISTIK
            const userSeats = occupiedSeats.filter(s => s.reservationType === 'user').length;
            const adminSeats = occupiedSeats.filter(s => s.reservationType === 'admin').length;
            const voucherSeats = occupiedSeats.filter(s => s.reservationType === 'voucher').length;
            const markedSeats = occupiedSeats.filter(s => s.reservationType === 'marked').length;
            const availableSeats = totalSeats - occupiedSeats.length;
            
            const getPercentage = (count: number) => ((count / totalSeats) * 100).toFixed(1);
            
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* GESAMT */}
                <div style={{ 
                  paddingBottom: '0.75rem', 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                      Gesamt
                    </span>
                    <span style={{ color: '#d4af37', fontSize: '0.875rem', fontWeight: '700' }}>
                      {totalSeats} Sitze
                    </span>
                  </div>
                </div>

                {/* VERKAUFT (USER) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Verkauft
                    </span>
                    <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '600' }}>
                      {userSeats} ({getPercentage(userSeats)}%)
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${getPercentage(userSeats)}%`, 
                      height: '100%', 
                      backgroundColor: '#ef4444',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* ADMIN */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Admin
                    </span>
                    <span style={{ color: '#f97316', fontSize: '0.875rem', fontWeight: '600' }}>
                      {adminSeats} ({getPercentage(adminSeats)}%)
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${getPercentage(adminSeats)}%`, 
                      height: '100%', 
                      backgroundColor: '#f97316',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* FREIKARTEN */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Freikarten
                    </span>
                    <span style={{ color: '#089383', fontSize: '0.875rem', fontWeight: '600' }}>
                      {voucherSeats} ({getPercentage(voucherSeats)}%)
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${getPercentage(voucherSeats)}%`, 
                      height: '100%', 
                      backgroundColor: '#089383',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* VORGEMERKT */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Vorgemerkt
                    </span>
                    <span style={{ color: '#facc15', fontSize: '0.875rem', fontWeight: '600' }}>
                      {markedSeats} ({getPercentage(markedSeats)}%)
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${getPercentage(markedSeats)}%`, 
                      height: '100%', 
                      backgroundColor: '#facc15',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* VERFÜGBAR */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Verfügbar
                    </span>
                    <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                      {availableSeats} ({getPercentage(availableSeats)}%)
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${getPercentage(availableSeats)}%`, 
                      height: '100%', 
                      backgroundColor: '#10b981',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* AUSGEWÄHLTE SITZE */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem',
          maxHeight: isMobile ? '400px' : 'none',
          overflowY: isMobile ? 'auto' : 'visible',
        }}>
          {selectedSeats.length === 0 ? (
            <div style={{
              padding: isMobile ? '1.5rem' : '2rem',
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
                    padding: isMobile ? '0.875rem' : '1rem',
                    border: isOccupied
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        {/* COLOR INDICATOR */}
                        {isOccupied && details && (
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 
                              details.reservationType === 'admin' ? '#f97316' :
                              details.reservationType === 'voucher' ? '#089383' :
                              details.reservationType === 'marked' ? '#facc15' :
                              '#ef4444',
                            flexShrink: 0,
                          }} />
                        )}
                        
                        <p style={{
                          color: 'white',
                          fontWeight: '600',
                          margin: 0,
                          fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                          Reihe {seat.row}, Platz {seat.number}
                        </p>
                        
                        {/* TYPE LABEL */}
                        {isOccupied && details && (
                          <span style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontWeight: '500',
                          }}>
                            {details.reservationType === 'admin' && '(Admin)'}
                            {details.reservationType === 'voucher' && '(Freikarte)'}
                            {details.reservationType === 'marked' && '(Vorgemerkt)'}
                            {details.reservationType === 'user' && '(Bezahlt)'}
                          </span>
                        )}
                      </div>
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
                              gap: '0.5rem',
                              wordBreak: 'break-all',
                            }}>
                              <Mail style={{ width: '14px', height: '14px', flexShrink: 0 }} />
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
              <>
                <button
                  onClick={onReserve}
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.875rem' : '0.875rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: isMobile ? '0.875rem' : '0.875rem',
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

                <button
                  onClick={onMark}
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.875rem' : '0.875rem',
                    background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#000',
                    fontSize: isMobile ? '0.875rem' : '0.875rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Bookmark style={{ width: '18px', height: '18px' }} />
                  Vormerken ({selectedFreeCount})
                </button>
              </>
            )}
          </div>
        )}

        {/* ALLE FREIGEBEN */}
        {occupiedSeats.length > 0 && (
          <button
            onClick={() => setConfirmModalOpen(true)}
            style={{
              width: '100%',
              padding: isMobile ? '0.875rem' : '0.875rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              color: '#ef4444',
              fontSize: isMobile ? '0.875rem' : '0.875rem',
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

        {/* INFO BOX */}
        {!isMobile && (
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
        )}
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