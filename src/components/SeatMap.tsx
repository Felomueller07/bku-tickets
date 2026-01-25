'use client';

import { useState, Fragment, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import SeatDetailsModal from './SeatDetailsModal';
import AdminSidebar from './AdminSidebar';
import SeatInfoPanel from './SeatInfoPanel';
import UserSidebar from './UserSidebar';
import { ShoppingCart, Lock } from 'lucide-react';

// ========================================
// SITZPLATZ-KOMPONENTE (SVG-STUHL)
// ========================================
function SeatChair({
  row,
  number,
  rotation = 0,
  isOccupied,
  isSelected,
  isAdmin,
  onToggleSelect,
  isMobile = false
}: {
  row: string;
  number: number;
  rotation?: number;
  isOccupied: boolean;
  isSelected: boolean;
  isAdmin: boolean;
  onToggleSelect: (row: string, number: number) => void;
  isMobile?: boolean;
}) {

  const handleClick = () => {
    onToggleSelect(row, number);
  };

  const getColor = () => {
    if (isOccupied && isSelected) {
      return '#b91c1c';
    } else if (isOccupied) {
      return '#ef4444';
    } else if (isSelected) {
      return '#4ade80';
    } else {
      return '#e8e8e8';
    }
  };

  const seatSize = isMobile ? 40 : 32;
  const margin = isMobile ? -8 : -6;

  return (
    <motion.svg
      width={seatSize}
      height={seatSize}
      viewBox="0 0 50 50"
      onClick={handleClick}
      style={{
        cursor: isOccupied && !isAdmin ? 'not-allowed' : 'pointer',
        marginLeft: rotation === 0 ? `${margin}px` : '0',
        marginRight: rotation === 0 ? `${margin}px` : '0',
        marginTop: rotation !== 0 ? `${margin}px` : '0',
        marginBottom: rotation !== 0 ? `${margin}px` : '0',
      }}
      animate={{ rotate: rotation }}
      whileHover={{ scale: 1.15, zIndex: 10, rotate: rotation }}
      whileTap={{ scale: 0.95, rotate: rotation }}
    >
      <path
        d="M 10 26 L 10 12 Q 10 3, 25 3 Q 40 3, 40 12 L 40 26 L 10 26 Z"
        fill={getColor()}
        stroke="#000"
        strokeWidth="2.5"
      />
      <rect
        x="10"
        y="30"
        width="30"
        height="11"
        rx="5"
        fill={getColor()}
        stroke="#000"
        strokeWidth="2.5"
      />
      <text
        x="25"
        y="19"
        textAnchor="middle"
        fontSize="15"
        fontWeight="bold"
        fill="#000"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {number}
      </text>
      {isOccupied && (
        <text
          x="25"
          y="36"
          textAnchor="middle"
          fontSize="12"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          🔒
        </text>
      )}
    </motion.svg>
  );
}

// ========================================
// LEERER PLATZHALTER
// ========================================
function EmptySeat({ isMobile = false }: { isMobile?: boolean }) {
  const seatSize = isMobile ? 40 : 32;
  const margin = isMobile ? -8 : -6;
  return (
    <div style={{ width: `${seatSize}px`, height: `${seatSize}px`, marginLeft: `${margin}px`, marginRight: `${margin}px` }}></div>
  );
}

// ========================================
// HAUPTKOMPONENTE
// ========================================
export default function SeatMap() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  const [selectedSeats, setSelectedSeats] = useState<Array<{ row: string; number: number }>>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<Array<{
    row: string;
    number: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    note?: string;
    createdAt?: string;
    userId?: number;
    user?: {
      id: number;
      email: string;
      name: string;
    };
  }>>([]);

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'reserve' | 'edit'>('reserve');
  const [currentEditSeat, setCurrentEditSeat] = useState<{ row: string; number: number } | null>(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [infoPanelSeat, setInfoPanelSeat] = useState<{ row: string; number: number } | null>(null);
  
  // Mobile States
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadSeats();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadSeats = async () => {
    try {
      const response = await fetch('/api/seats');
      if (response.ok) {
        const data = await response.json();
        const mappedSeats = data.map((seat: any) => ({
          row: seat.row,
          number: seat.number,
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          email: seat.email || '',
          note: seat.note || '',
          createdAt: seat.createdAt,
          userId: seat.userId,
          user: seat.user,
        }));
        setOccupiedSeats(mappedSeats);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden:', error);
      setLoading(false);
    }
  };

  const handleToggleSelect = (row: string, number: number) => {
    const isCurrentlySelected = selectedSeats.some(s => s.row === row && s.number === number);
    const isOcc = isSeatOccupied(row, number);

    if (isOcc && !isAdmin) {
      toast.error(`Sitz ${row}${number} ist bereits reserviert`, { duration: 2000 });
      return;
    }

    if (isOcc && isAdmin && !isCurrentlySelected) {
      setInfoPanelSeat({ row, number });
      setInfoPanelOpen(true);
      return;
    }

    if (isCurrentlySelected) {
      setSelectedSeats(selectedSeats.filter(s => !(s.row === row && s.number === number)));
      toast.info(`Sitz ${row}${number} abgewählt`, { duration: 1500 });
    } else {
      setSelectedSeats([...selectedSeats, { row, number }]);
      toast.success(`Sitz ${row}${number} ausgewählt`, { duration: 1500 });
    }
  };

  const isSeatOccupied = (row: string, number: number) => {
    return occupiedSeats.some(s => s.row === row && s.number === number);
  };

  const isSeatSelected = (row: string, number: number) => {
    return selectedSeats.some(s => s.row === row && s.number === number);
  };

  const getSeatDetails = (row: string, number: number) => {
    return occupiedSeats.find(s => s.row === row && s.number === number);
  };

  const handleReserveClick = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Keine Sitze ausgewählt');
      return;
    }

    const freeSeats = selectedSeats.filter(s => !isSeatOccupied(s.row, s.number));

    if (freeSeats.length === 0) {
      toast.error('Nur besetzte Sitze ausgewählt');
      return;
    }

    try {
      const response = await fetch('/api/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: freeSeats.map(s => ({
            row: s.row,
            number: s.number,
            firstName: '',
            lastName: '',
            note: '',
          }))
        })
      });

      if (response.ok) {
        await loadSeats();
        setSelectedSeats([]);
        toast.success(`${freeSeats.length} Sitz(e) reserviert`, { duration: 2000 });
      } else {
        toast.error('Fehler beim Reservieren');
      }
    } catch (error) {
      console.error('Fehler:', error);
      toast.error('Fehler beim Reservieren');
    }
  };

  const handleModalSave = async (data: { firstName: string; lastName: string; email: string; applyToAll: boolean }) => {
    if (modalMode === 'edit' && currentEditSeat) {
      try {
        if (data.applyToAll && selectedSeats.length > 1) {
          const updates = selectedSeats
            .filter(s => isSeatOccupied(s.row, s.number))
            .map(seat =>
              fetch(`/api/seats/${seat.row}/${seat.number}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  firstName: data.firstName,
                  lastName: data.lastName,
                  email: data.email,
                })
              })
            );

          await Promise.all(updates);
          await loadSeats();
          toast.success(`Daten auf ${updates.length} Sitze angewendet`, { duration: 2000 });
        } else {
          const response = await fetch(`/api/seats/${currentEditSeat.row}/${currentEditSeat.number}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
            })
          });

          if (response.ok) {
            await loadSeats();
            toast.success('Details aktualisiert', { duration: 2000 });
          } else {
            toast.error('Fehler beim Speichern');
          }
        }
      } catch (error) {
        console.error('Fehler:', error);
        toast.error('Fehler beim Speichern');
      }
    }
  };

  const handleAdminRelease = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Keine Sitze ausgewählt');
      return;
    }

    const occupiedSelected = selectedSeats.filter(s => isSeatOccupied(s.row, s.number));

    if (occupiedSelected.length === 0) {
      toast.error('Nur freie Sitze ausgewählt');
      return;
    }

    try {
      const response = await fetch('/api/seats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: occupiedSelected })
      });

      if (response.ok) {
        await loadSeats();
        setSelectedSeats([]);
        toast.success(`${occupiedSelected.length} Sitz(e) freigegeben`, { duration: 2000 });
      } else {
        toast.error('Fehler beim Freigeben');
      }
    } catch (error) {
      console.error('Fehler:', error);
      toast.error('Fehler beim Freigeben');
    }
  };

  const handleAdminReleaseAll = async () => {
    if (occupiedSeats.length === 0) {
      toast.info('Keine Sitze zu löschen');
      return;
    }

    try {
      const response = await fetch('/api/seats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: occupiedSeats })
      });

      if (response.ok) {
        await loadSeats();
        setSelectedSeats([]);
        toast.success('Alle Sitze freigegeben', { duration: 2000 });
      } else {
        toast.error('Fehler beim Freigeben');
      }
    } catch (error) {
      console.error('Fehler:', error);
      toast.error('Fehler beim Freigeben');
    }
  };

  const handleSidebarSeatClick = (row: string, number: number) => {
    if (isSeatOccupied(row, number)) {
      setCurrentEditSeat({ row, number });
      setModalMode('edit');
      setModalOpen(true);
    }
  };

  const handleAddDataClick = (row: string, number: number) => {
    setCurrentEditSeat({ row, number });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleInfoPanelEdit = () => {
    if (infoPanelSeat) {
      setCurrentEditSeat(infoPanelSeat);
      setModalMode('edit');
      setModalOpen(true);
      setInfoPanelOpen(false);
    }
  };

  const getInfoPanelData = () => {
    if (infoPanelSeat) {
      return getSeatDetails(infoPanelSeat.row, infoPanelSeat.number);
    }
    return undefined;
  };

  const handleRemoveSeat = (row: string, number: number) => {
    setSelectedSeats(prev => prev.filter(s => !(s.row === row && s.number === number)));
  };

  const mainRowLetters = ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];

  const mainRows = mainRowLetters.map(letter => ({
    letter,
    leftSeats: Array.from({ length: 12 }, (_, i) => i + 4),
    rightSeats: Array.from({ length: 12 }, (_, i) => i + 16)
  }));

  const backRows = [
    { letter: 'Z', leftRange: { start: 4, end: 15 }, leftActual: [7, 8, 9, 10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
    { letter: 'ZB', leftRange: { start: 4, end: 15 }, leftActual: [7, 8, 9, 10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19, 20, 21, 22, 23, 24] },
    { letter: 'ZC', leftRange: { start: 4, end: 15 }, leftActual: [7, 8, 9, 10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19, 20, 21, 22, 23, 24] },
    { letter: 'ZD', leftRange: { start: 4, end: 15 }, leftActual: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
    { letter: 'ZE', leftRange: { start: 4, end: 15 }, leftActual: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
  ];

  const veryBackRows = [
    { letter: 'ZF', leftRange: { start: 4, end: 15 }, leftActual: [10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19] },
    { letter: 'ZG', leftRange: { start: 4, end: 15 }, leftActual: [10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19] },
    { letter: 'ZH', leftRange: { start: 4, end: 15 }, leftActual: [10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19] },
    { letter: 'ZJ', leftRange: { start: 4, end: 15 }, leftActual: [10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19] },
    { letter: 'ZK', leftRange: { start: 4, end: 15 }, leftActual: [10, 11, 12, 13, 14, 15], rightRange: { start: 16, end: 27 }, rightActual: [16, 17, 18, 19] },
  ];

  const sideRowsLeft = [
    [38, 37, 36, 35],
    [34, 33, 32, 31, 30, 29, 28, 27, 26, 25],
    [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13],
    [12, 11, 10, 9, 8, 7, 6, 5, 4],
    [3, 2, 1],
  ];

  const getModalLabel = () => {
    if (modalMode === 'edit' && currentEditSeat) {
      return `${currentEditSeat.row}${currentEditSeat.number}`;
    }
    if (selectedSeats.length === 1) {
      return `${selectedSeats[0].row}${selectedSeats[0].number}`;
    }
    return `${selectedSeats.length} Sitze`;
  };

  const getModalInitialData = () => {
    if (modalMode === 'edit' && currentEditSeat) {
      return getSeatDetails(currentEditSeat.row, currentEditSeat.number);
    }
    return undefined;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ color: 'white', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>Lade Sitzplan...</div>
      </div>
    );
  }

  return (
    <>
      <SeatDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        initialData={getModalInitialData()}
        seatLabel={getModalLabel()}
        hasMultipleSeats={selectedSeats.filter(s => isSeatOccupied(s.row, s.number)).length > 1}
      />

      <SeatInfoPanel
        isOpen={infoPanelOpen}
        onClose={() => setInfoPanelOpen(false)}
        onEdit={handleInfoPanelEdit}
        seatLabel={infoPanelSeat ? `${infoPanelSeat.row}${infoPanelSeat.number}` : ''}
        firstName={getInfoPanelData()?.firstName}
        lastName={getInfoPanelData()?.lastName}
        email={getInfoPanelData()?.email}
        note={getInfoPanelData()?.note}
        createdAt={getInfoPanelData()?.createdAt}
        reservedByUserId={getInfoPanelData()?.userId}
        reservedByUser={getInfoPanelData()?.user}
        currentUserId={Number((session?.user as any)?.id)}
      />

      <div style={{ 
        maxWidth: isMobile ? '100%' : '1800px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '0' : '2rem', 
        alignItems: 'flex-start', 
        paddingBottom: isMobile ? '0' : '2rem'
      }}>

        {/* SITZPLAN */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.3)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: isMobile ? '0' : '1rem', 
          padding: isMobile ? '1rem' : '2rem', 
          border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
          overflowX: isMobile ? 'auto' : 'visible',
          minHeight: isMobile ? 'calc(100vh - 120px)' : 'auto',
        }}>

          <p style={{ 
            color: 'white', 
            marginBottom: isMobile ? '1rem' : '1.5rem', 
            fontSize: isMobile ? '1rem' : '1.125rem', 
            textAlign: 'center' 
          }}>
            Sitzplan {isAdmin && <span style={{ color: '#d4af37' }}>(Admin-Modus)</span>}
          </p>

          {/* BÜHNE */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '1.5rem' : '2rem' }}>
            <div style={{ 
              width: isMobile ? '100%' : '600px', 
              height: isMobile ? '60px' : '200px', 
              background: 'linear-gradient(180deg, rgba(90, 74, 66, 0.4) 0%, rgba(90, 74, 66, 0.2) 100%)', 
              border: '2px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span style={{ 
                color: '#d4af37', 
                fontSize: isMobile ? '14px' : '22px', 
                fontWeight: '300', 
                letterSpacing: isMobile ? '2px' : '4px', 
                textTransform: 'uppercase', 
                fontFamily: 'Georgia, serif', 
                textShadow: '0 2px 8px rgba(212, 175, 55, 0.3)' 
              }}>
                Bühne
              </span>
            </div>
          </div>

          {/* SITZPLAN CONTAINER */}
          <div style={{ 
            position: 'relative',
            minWidth: isMobile ? '900px' : 'auto',
          }}>

            {/* GALERIE-EBENE */}
            <div style={{ position: 'absolute', top: isMobile ? '-180px' : '-230px', left: 0, right: 0, bottom: 0 }}>

              {/* LINKE GALERIE */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                bottom: 0, 
                width: isMobile ? '120px' : '150px', 
                border: '2px solid rgba(255, 255, 255, 0.3)', 
                borderRadius: '1rem', 
                backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                padding: isMobile ? '1rem 0.5rem' : '1.5rem 1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}>
                <div style={{ 
                  color: '#d4af37', 
                  fontSize: isMobile ? '10px' : '14px', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem', 
                  letterSpacing: '1px' 
                }}>
                  GALERIE
                </div>

                <div style={{ display: 'flex', gap: isMobile ? '0.25rem' : '0.5rem' }}>
                  {['BA', 'BB'].map(col => (
                    <div key={col} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '10px' : '14px', 
                        fontWeight: 'bold', 
                        textAlign: 'center', 
                        marginBottom: '0.5rem', 
                        width: isMobile ? '40px' : '32px' 
                      }}>
                        {col}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '2.5rem' : '3rem' }}>
                        {sideRowsLeft.map((group, groupIdx) => (
                          <div key={groupIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {group.map(seatNum => (
                              <SeatChair
                                key={`${col}-${seatNum}`}
                                row={col}
                                number={seatNum}
                                rotation={90}
                                isOccupied={isSeatOccupied(col, seatNum)}
                                isSelected={isSeatSelected(col, seatNum)}
                                isAdmin={isAdmin}
                                onToggleSelect={handleToggleSelect}
                                isMobile={isMobile}
                              />
                            ))}
                          </div>
                        ))}
                      </div>

                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '10px' : '14px', 
                        fontWeight: 'bold', 
                        textAlign: 'center', 
                        marginTop: '0.5rem', 
                        width: isMobile ? '40px' : '32px' 
                      }}>
                        {col}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECHTE GALERIE */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                bottom: 0, 
                width: isMobile ? '120px' : '150px', 
                border: '2px solid rgba(255, 255, 255, 0.3)', 
                borderRadius: '1rem', 
                backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                padding: isMobile ? '1rem 0.5rem' : '1.5rem 1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}>
                <div style={{ 
                  color: '#d4af37', 
                  fontSize: isMobile ? '10px' : '14px', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem', 
                  letterSpacing: '1px' 
                }}>
                  GALERIE
                </div>

                <div style={{ display: 'flex', gap: isMobile ? '0.25rem' : '0.5rem' }}>
                  {['BC', 'BD'].map(col => (
                    <div key={col} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '10px' : '14px', 
                        fontWeight: 'bold', 
                        textAlign: 'center', 
                        marginBottom: '0.5rem', 
                        width: isMobile ? '40px' : '32px' 
                      }}>
                        {col}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '2.5rem' : '3rem' }}>
                        {sideRowsLeft.map((group, groupIdx) => (
                          <div key={groupIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {group.map(seatNum => (
                              <SeatChair
                                key={`${col}-${seatNum}`}
                                row={col}
                                number={seatNum}
                                rotation={-90}
                                isOccupied={isSeatOccupied(col, seatNum)}
                                isSelected={isSeatSelected(col, seatNum)}
                                isAdmin={isAdmin}
                                onToggleSelect={handleToggleSelect}
                                isMobile={isMobile}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '10px' : '14px', 
                        fontWeight: 'bold', 
                        textAlign: 'center', 
                        marginTop: '0.5rem', 
                        width: isMobile ? '40px' : '32px' 
                      }}>
                        {col}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* UNTERE GALERIE (BM) */}
              <div style={{ 
                position: 'absolute', 
                bottom: '20px', 
                left: isMobile ? '150px' : '200px', 
                right: isMobile ? '150px' : '200px', 
                border: '2px solid rgba(255, 255, 255, 0.3)', 
                borderRadius: '1rem', 
                backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                padding: isMobile ? '0.75rem' : '1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.75rem' }}>
                  <div style={{ 
                    color: 'white', 
                    fontSize: isMobile ? '10px' : '14px', 
                    fontWeight: 'bold' 
                  }}>
                    BM
                  </div>

                  <div style={{ display: 'flex', gap: '0px' }}>
                    {[1, 2, 3, 4].map(num => (
                      <SeatChair
                        key={`BM-${num}`}
                        row="BM"
                        number={num}
                        isOccupied={isSeatOccupied('BM', num)}
                        isSelected={isSeatSelected('BM', num)}
                        isAdmin={isAdmin}
                        onToggleSelect={handleToggleSelect}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0px' }}>
                    {[5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                      <SeatChair
                        key={`BM-${num}`}
                        row="BM"
                        number={num}
                        isOccupied={isSeatOccupied('BM', num)}
                        isSelected={isSeatSelected('BM', num)}
                        isAdmin={isAdmin}
                        onToggleSelect={handleToggleSelect}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0px' }}>
                    {[13, 14, 15, 16].map(num => (
                      <SeatChair
                        key={`BM-${num}`}
                        row="BM"
                        number={num}
                        isOccupied={isSeatOccupied('BM', num)}
                        isSelected={isSeatSelected('BM', num)}
                        isAdmin={isAdmin}
                        onToggleSelect={handleToggleSelect}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>

                  <div style={{ 
                    color: 'white', 
                    fontSize: isMobile ? '10px' : '14px', 
                    fontWeight: 'bold' 
                  }}>
                    BM
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.75rem' }}>
                  <div style={{ 
                    color: 'white', 
                    fontSize: isMobile ? '10px' : '14px', 
                    fontWeight: 'bold' 
                  }}>
                    BM
                  </div>
                  <div style={{ display: 'flex', gap: '0px' }}>
                    {[17, 18, 19, 20, 21, 22].map(num => (
                      <SeatChair
                        key={`BM-${num}`}
                        row="BM"
                        number={num}
                        isOccupied={isSeatOccupied('BM', num)}
                        isSelected={isSeatSelected('BM', num)}
                        isAdmin={isAdmin}
                        onToggleSelect={handleToggleSelect}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                  <div style={{ 
                    color: 'white', 
                    fontSize: isMobile ? '10px' : '14px', 
                    fontWeight: 'bold' 
                  }}>
                    BM
                  </div>
                </div>
              </div>
            </div>

            {/* PARKETT-EBENE */}
            <div style={{ 
              position: 'relative', 
              zIndex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              padding: isMobile ? '1.5rem 8rem 7rem 8rem' : '2rem 10rem 9rem 10rem', 
              pointerEvents: 'none' 
            }}>
              <div style={{ pointerEvents: 'auto' }}>

                {/* HAUPTREIHEN E-Y */}
                {mainRows.map(({ letter, leftSeats, rightSeats }) => (
                  <Fragment key={letter}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '2px', 
                      gap: isMobile ? '12px' : '20px' 
                    }}>
                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '12px' : '16px', 
                        fontWeight: 'bold', 
                        width: isMobile ? '18px' : '22px', 
                        textAlign: 'center', 
                        flexShrink: 0 
                      }}>
                        {letter}
                      </div>

                      <div style={{ display: 'flex', gap: '0px' }}>
                        {leftSeats.map(number => (
                          <SeatChair
                            key={`${letter}-${number}`}
                            row={letter}
                            number={number}
                            isOccupied={isSeatOccupied(letter, number)}
                            isSelected={isSeatSelected(letter, number)}
                            isAdmin={isAdmin}
                            onToggleSelect={handleToggleSelect}
                            isMobile={isMobile}
                          />
                        ))}
                      </div>

                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '14px' : '20px', 
                        fontWeight: 'bold', 
                        width: isMobile ? '25px' : '35px', 
                        textAlign: 'center', 
                        flexShrink: 0, 
                        padding: isMobile ? '0 8px' : '0 12px' 
                      }}>
                        {letter}
                      </div>

                      <div style={{ display: 'flex', gap: '0px' }}>
                        {rightSeats.map(number => (
                          <SeatChair
                            key={`${letter}-${number}`}
                            row={letter}
                            number={number}
                            isOccupied={isSeatOccupied(letter, number)}
                            isSelected={isSeatSelected(letter, number)}
                            isAdmin={isAdmin}
                            onToggleSelect={handleToggleSelect}
                            isMobile={isMobile}
                          />
                        ))}
                      </div>

                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '12px' : '16px', 
                        fontWeight: 'bold', 
                        width: isMobile ? '18px' : '22px', 
                        textAlign: 'center', 
                        flexShrink: 0 
                      }}>
                        {letter}
                      </div>
                    </div>

                    {letter === 'N' && <div style={{ height: isMobile ? '1.5rem' : '2rem' }}></div>}
                  </Fragment>
                ))}

                {/* HINTERE REIHEN Z-ZE */}
                <div style={{ marginTop: '2px' }}>
                  {backRows.map(({ letter, leftRange, leftActual, rightRange, rightActual }) => (
                    <div key={letter} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '2px', 
                      gap: isMobile ? '12px' : '20px' 
                    }}>
                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '12px' : '16px', 
                        fontWeight: 'bold', 
                        width: isMobile ? '18px' : '22px', 
                        textAlign: 'center', 
                        flexShrink: 0 
                      }}>
                        {letter}
                      </div>

                      <div style={{ display: 'flex', gap: '0px' }}>
                        {Array.from({ length: leftRange.end - leftRange.start + 1 }, (_, i) => leftRange.start + i).map(number => (
                          <div key={`${letter}-${number}`}>
                            {leftActual.includes(number) ? (
                              <SeatChair
                                row={letter}
                                number={number}
                                isOccupied={isSeatOccupied(letter, number)}
                                isSelected={isSeatSelected(letter, number)}
                                isAdmin={isAdmin}
                                onToggleSelect={handleToggleSelect}
                                isMobile={isMobile}
                              />
                            ) : (
                              <EmptySeat isMobile={isMobile} />
                            )}
                          </div>
                        ))}
                      </div>

                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '14px' : '20px', 
                        fontWeight: 'bold', 
                        width: isMobile ? '25px' : '35px', 
                        textAlign: 'center', 
                        flexShrink: 0, 
                        padding: isMobile ? '0 8px' : '0 12px' 
                      }}>
                        {letter}
                      </div>

                      <div style={{ display: 'flex', gap: '0px' }}>
                        {Array.from({ length: rightRange.end - rightRange.start + 1 }, (_, i) => rightRange.start + i).map(number => (
                          <div key={`${letter}-${number}`}>
                            {rightActual.includes(number) ? (
                              <SeatChair
                                row={letter}
                                number={number}
                                isOccupied={isSeatOccupied(letter, number)}
                                isSelected={isSeatSelected(letter, number)}
                                isAdmin={isAdmin}
                                onToggleSelect={handleToggleSelect}
                                isMobile={isMobile}
                              />
                            ) : (
                              <EmptySeat isMobile={isMobile} />
                            )}
                          </div>
                        ))}
                      </div>

                      <div style={{ 
                        color: 'white', 
                        fontSize: isMobile ? '12px' : '16px', 
                        fontWeight: 'bold', 
                        width: isMobile ? '18px' : '22px', 
                        textAlign: 'center', 
                        flexShrink: 0 
                      }}>
                        {letter}
                      </div>
                    </div>
                  ))}
                </div>

                {/* TREPPEN */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '4px', 
                  marginTop: '1rem', 
                  marginBottom: '1rem', 
                  width: '100%' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    marginLeft: isMobile ? '-60px' : '-70px' 
                  }}>
                    <div style={{ 
                      width: isMobile ? '250px' : '292px', 
                      height: isMobile ? '6px' : '8px', 
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)', 
                      border: '1px solid rgba(255, 255, 255, 0.3)', 
                      borderRadius: '2px' 
                    }}></div>
                    <div style={{ 
                      width: isMobile ? '250px' : '292px', 
                      height: isMobile ? '6px' : '8px', 
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%)', 
                      border: '1px solid rgba(255, 255, 255, 0.25)', 
                      borderRadius: '2px' 
                    }}></div>
                    <div style={{ 
                      width: isMobile ? '250px' : '292px', 
                      height: isMobile ? '6px' : '8px', 
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)', 
                      borderRadius: '2px' 
                    }}></div>
                  </div>
                </div>

                {/* GANZ HINTERE REIHEN ZF-ZK */}
                <div style={{ marginTop: '0px', position: 'relative' }}>
                  {veryBackRows.map(({ letter, leftActual, rightActual }) => (
                    <div key={letter} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '2px', 
                      position: 'relative', 
                      height: isMobile ? '40px' : '32px' 
                    }}>

                      <div style={{ 
                        position: 'absolute', 
                        left: '0px', 
                        color: 'white', 
                        fontSize: isMobile ? '12px' : '16px', 
                        fontWeight: 'bold', 
                        width: isMobile ? '18px' : '22px', 
                        textAlign: 'center' 
                      }}>
                        {letter}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginLeft: isMobile ? '110px' : '130px', 
                        gap: '5px' 
                      }}>
                        <div style={{ display: 'flex', gap: '0px' }}>
                          {[10, 11].map(number => (
                            leftActual.includes(number) ? (
                              <SeatChair
                                key={`${letter}-${number}`}
                                row={letter}
                                number={number}
                                isOccupied={isSeatOccupied(letter, number)}
                                isSelected={isSeatSelected(letter, number)}
                                isAdmin={isAdmin}
                                onToggleSelect={handleToggleSelect}
                                isMobile={isMobile}
                              />
                            ) : (
                              <EmptySeat key={`${letter}-empty-${number}`} isMobile={isMobile} />
                            )
                          ))}
                        </div>

                        <div style={{ width: isMobile ? '15px' : '20px' }}></div>

                        <div style={{ display: 'flex', gap: '0px' }}>
                          {[12, 13, 14, 15].map(number => (
                            leftActual.includes(number) ? (
                              <SeatChair
                                key={`${letter}-${number}`}
                                row={letter}
                                number={number}
                                isOccupied={isSeatOccupied(letter, number)}
                                isSelected={isSeatSelected(letter, number)}
                                isAdmin={isAdmin}
                                onToggleSelect={handleToggleSelect}
                                isMobile={isMobile}
                              />
                            ) : (
                              <EmptySeat key={`${letter}-empty-${number}`} isMobile={isMobile} />
                            )
                          ))}
                        </div>
                      </div>

                      <div style={{ 
                        position: 'absolute', 
                        left: isMobile ? '260px' : '300px', 
                        color: 'white', 
                        fontSize: isMobile ? '14px' : '20px', 
                        fontWeight: 'bold', 
                        width: isMobile ? '25px' : '35px', 
                        textAlign: 'center', 
                        padding: isMobile ? '0 8px' : '0 12px' 
                      }}>
                        {letter}
                      </div>

                      <div style={{ 
                        position: 'absolute', 
                        left: isMobile ? '310px' : '360px', 
                        display: 'flex', 
                        gap: '0px' 
                      }}>
                        {[16, 17, 18, 19].map(number => (
                          rightActual.includes(number) ? (
                            <SeatChair
                              key={`${letter}-${number}`}
                              row={letter}
                              number={number}
                              isOccupied={isSeatOccupied(letter, number)}
                              isSelected={isSeatSelected(letter, number)}
                              isAdmin={isAdmin}
                              onToggleSelect={handleToggleSelect}
                              isMobile={isMobile}
                            />
                          ) : (
                            <EmptySeat key={`${letter}-empty-${number}`} isMobile={isMobile} />
                          )
                        ))}
                      </div>

                      <div style={{ 
                        position: 'absolute', 
                        right: '0px', 
                        color: 'white', 
                        fontSize: isMobile ? '12px' : '16px', 
                        fontWeight: 'bold', 
                        width: isMobile ? '18px' : '22px', 
                        textAlign: 'center' 
                      }}>
                        {letter}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP SIDEBAR */}
        {!isMobile && (
          <>
            {isAdmin ? (
              <AdminSidebar
                selectedSeats={selectedSeats}
                occupiedSeats={occupiedSeats}
                isSeatOccupied={isSeatOccupied}
                onReserve={handleReserveClick}
                onRelease={handleAdminRelease}
                onReleaseAll={handleAdminReleaseAll}
                onSeatClick={handleSidebarSeatClick}
                onAddDataClick={handleAddDataClick}
                isMobile={false}
              />
            ) : (
              <UserSidebar
                selectedSeats={selectedSeats}
                onRemoveSeat={handleRemoveSeat}
                isMobile={false}
              />
            )}
          </>
        )}

        {/* MOBILE FLOATING ACTION BUTTON */}
        {isMobile && selectedSeats.length > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '1rem',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
              border: 'none',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 40,
            }}
          >
            {isAdmin ? (
              <Lock style={{ width: '28px', height: '28px', color: '#000' }} />
            ) : (
              <div style={{ position: 'relative' }}>
                <ShoppingCart style={{ width: '28px', height: '28px', color: '#000' }} />
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                }}>
                  {selectedSeats.length}
                </div>
              </div>
            )}
          </motion.button>
        )}

        {/* MOBILE BOTTOM SHEET */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  zIndex: 50,
                }}
              />
              
              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  maxHeight: '80vh',
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  borderTopLeftRadius: '1.5rem',
                  borderTopRightRadius: '1.5rem',
                  zIndex: 51,
                  overflowY: 'auto',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                {/* Drag Handle */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '1rem',
                  cursor: 'pointer',
                }}
                onClick={() => setSidebarOpen(false)}
                >
                  <div style={{
                    width: '40px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '2px',
                  }} />
                </div>

                {isAdmin ? (
                  <div style={{ padding: '0 1.5rem 2rem' }}>
                    <AdminSidebar
                      selectedSeats={selectedSeats}
                      occupiedSeats={occupiedSeats}
                      isSeatOccupied={isSeatOccupied}
                      onReserve={handleReserveClick}
                      onRelease={handleAdminRelease}
                      onReleaseAll={handleAdminReleaseAll}
                      onSeatClick={handleSidebarSeatClick}
                      onAddDataClick={handleAddDataClick}
                      isMobile={true}
                    />
                  </div>
                ) : (
                  <div style={{ padding: '0 1.5rem 2rem' }}>
                    <UserSidebar
                      selectedSeats={selectedSeats}
                      onRemoveSeat={handleRemoveSeat}
                      isMobile={true}
                    />
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}