'use client';

import { useState, Fragment, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import SeatDetailsModal from './SeatDetailsModal';
import AdminSidebar from './AdminSidebar';
import SeatInfoPanel from './SeatInfoPanel';
import UserSidebar from './UserSidebar';
import MobileCheckoutButton from './MobileCheckoutButton';
import MobileCheckoutPanel from './MobileCheckoutPanel';

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
  occupiedSeats,  // ⬅️ NEU HINZUFÜGEN!
}: {
  row: string;
  number: number;
  rotation?: number;
  isOccupied: boolean;
  isSelected: boolean;
  isAdmin: boolean;
  onToggleSelect: (row: string, number: number) => void;
  occupiedSeats: Array<{  // ⬅️ NEU HINZUFÜGEN!
    row: string;
    number: number;
    reservationType?: string | null;
  }>;
}) {

  const handleClick = () => {
    onToggleSelect(row, number);
  };

  // 4 FARBEN basierend auf Zustand
const getColor = () => {
    // ADMIN SICHT - Verschiedene Farben nach Typ
    if (isAdmin) {
      if (isOccupied && isSelected) {
        return '#7c2d12';  // DUNKELBRAUN = reserviert + ausgewählt
      }
      
      if (isOccupied) {
        // Hole Sitz-Details um reservationType zu prüfen
        const seat = occupiedSeats.find(s => s.row === row && s.number === number);
        
        switch (seat?.reservationType) {
          case 'admin':
            return '#f97316';    // 🟧 ORANGE = Admin reserviert
          case 'voucher':
            return '#22c55e';    // 🟩 GRÜN = Freikarte
          case 'marked':
            return '#facc15';    // 🟨 GELB = Vorgemerkt
          case 'user':
            return '#ef4444';    // 🔴 ROT = User bezahlt
          default:
            return '#ef4444';    // 🔴 ROT = Fallback
        }
      }
      
      if (isSelected) {
        return '#4ade80';  // GRÜN = ausgewählt
      }
      
      return '#e8e8e8';  // WEISS = verfügbar
    }
    
    // USER SICHT - Alles Reservierte ist ROT
    if (isOccupied && isSelected) {
      return '#b91c1c';  // DUNKELROT = reserviert + ausgewählt
    } else if (isOccupied) {
      return '#ef4444';  // ROT = reserviert (egal welcher Typ)
    } else if (isSelected) {
      return '#4ade80';  // GRÜN = ausgewählt
    } else {
      return '#e8e8e8';  // WEISS = verfügbar
    }
  };

  return (
    <motion.svg
      width="32"
      height="32"
      viewBox="0 0 50 50"
      onClick={handleClick}
      style={{
        cursor: isOccupied && !isAdmin ? 'not-allowed' : 'pointer',
        marginLeft: rotation === 0 ? '-6px' : '0',
        marginRight: rotation === 0 ? '-6px' : '0',
        marginTop: rotation !== 0 ? '-6px' : '0',
        marginBottom: rotation !== 0 ? '-6px' : '0',
      }}
      animate={{ rotate: rotation }}
      whileHover={{ scale: 1.15, zIndex: 10, rotate: rotation }}
      whileTap={{ scale: 0.95, rotate: rotation }}
    >
      {/* Rückenlehne */}
      <path
        d="M 10 26 L 10 12 Q 10 3, 25 3 Q 40 3, 40 12 L 40 26 L 10 26 Z"
        fill={getColor()}
        stroke="#000"
        strokeWidth="2.5"
      />

      {/* Sitzfläche */}
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

      {/* Platznummer */}
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

      {/* Schloss für besetzte Plätze */}
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
// LEERER PLATZHALTER (UNSICHTBAR)
// ========================================
function EmptySeat() {
  return (
    <div style={{ width: '32px', height: '32px', marginLeft: '-6px', marginRight: '-6px' }}></div>
  );
}

// ========================================
// HAUPTKOMPONENTE: SITZPLAN MIT DATENBANK
// ========================================
export default function SeatMap() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  // State für ausgewählte Sitze
  const [selectedSeats, setSelectedSeats] = useState<Array<{ row: string; number: number }>>([]);

  // State für reservierte Sitze
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

  // Loading State
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'reserve' | 'edit'>('reserve');
  const [currentEditSeat, setCurrentEditSeat] = useState<{ row: string; number: number } | null>(null);

  // Info-Panel State
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [infoPanelSeat, setInfoPanelSeat] = useState<{ row: string; number: number } | null>(null);

  // Mobile State
  const [isMobile, setIsMobile] = useState(false);

  // Mobile Checkout Panel State
  const [checkoutPanelOpen, setCheckoutPanelOpen] = useState(false);

  // ========================================
  // DATEN AUS DATENBANK LADEN (beim Start)
  // ========================================
  useEffect(() => {
    loadSeats();
  }, []);

  // Mobile Detection
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

  // Toggle Auswahl - MIT USER-SCHUTZ!
  const handleToggleSelect = (row: string, number: number) => {
    const isCurrentlySelected = selectedSeats.some(s => s.row === row && s.number === number);
    const isOcc = isSeatOccupied(row, number);

    // USER: Belegte Sitze NICHT anklickbar!
    if (isOcc && !isAdmin) {
      toast.error(`Sitz ${row}${number} ist bereits reserviert`, { duration: 2000 });
      return;
    }

    // ADMIN: Klick auf ROTEN Sitz → Info-Panel öffnen
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

  // Hilfsfunktionen
  const isSeatOccupied = (row: string, number: number) => {
    return occupiedSeats.some(s => s.row === row && s.number === number);
  };

  const isSeatSelected = (row: string, number: number) => {
    return selectedSeats.some(s => s.row === row && s.number === number);
  };

  const getSeatDetails = (row: string, number: number) => {
    return occupiedSeats.find(s => s.row === row && s.number === number);
  };

  // ========================================
  // ADMIN: RESERVIEREN (SPEICHERT IN DATENBANK)
  // ========================================
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

  // ========================================
  // DATEN SPEICHERN (UPDATE IN DATENBANK)
  // ========================================
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

  // ========================================
  // ADMIN: FREIGEBEN (LÖSCHT AUS DATENBANK)
  // ========================================
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

  // ========================================
  // ADMIN: ALLE FREIGEBEN
  // ========================================
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

  // Sidebar: Klick auf Sitz
  const handleSidebarSeatClick = (row: string, number: number) => {
    if (isSeatOccupied(row, number)) {
      setCurrentEditSeat({ row, number });
      setModalMode('edit');
      setModalOpen(true);
    }
  };

  // Sidebar: Klick auf + Daten Button
  const handleAddDataClick = (row: string, number: number) => {
    setCurrentEditSeat({ row, number });
    setModalMode('edit');
    setModalOpen(true);
  };

  // Info-Panel: Edit Button geklickt
  const handleInfoPanelEdit = () => {
    if (infoPanelSeat) {
      setCurrentEditSeat(infoPanelSeat);
      setModalMode('edit');
      setModalOpen(true);
      setInfoPanelOpen(false);
    }
  };

  // Info-Panel Daten holen
  const getInfoPanelData = () => {
    if (infoPanelSeat) {
      return getSeatDetails(infoPanelSeat.row, infoPanelSeat.number);
    }
    return undefined;
  };

  const handleRemoveSeat = (row: string, number: number) => {
    setSelectedSeats(prev => prev.filter(s => !(s.row === row && s.number === number)));
  };  

  // REIHEN-DEFINITIONEN
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

  // Label für Modal
  const getModalLabel = () => {
    if (modalMode === 'edit' && currentEditSeat) {
      return `${currentEditSeat.row}${currentEditSeat.number}`;
    }
    if (selectedSeats.length === 1) {
      return `${selectedSeats[0].row}${selectedSeats[0].number}`;
    }
    return `${selectedSeats.length} Sitze`;
  };

  // Initial Data für Modal
  const getModalInitialData = () => {
    if (modalMode === 'edit' && currentEditSeat) {
      return getSeatDetails(currentEditSeat.row, currentEditSeat.number);
    }
    return undefined;
  };

  // LOADING SPINNER
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Lade Sitzplan...</div>
      </div>
    );
  }

  return (
    <>
      {/* MODAL */}
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

      {/* MOBILE HEADER - NUR auf Mobile */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(20, 20, 20, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}>
          
          {/* LEFT: Event Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: '700', 
              color: '#d4af37',
              letterSpacing: '0.5px',
              lineHeight: '1.2',
            }}>
              Josefi Konzert
            </div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: 'white',
              lineHeight: '1.2',
            }}>
              2026
            </div>
          </div>

          {/* CENTER: BKU Badge */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '10px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <div style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#d4af37',
            }}></div>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#d4af37',
              letterSpacing: '1px',
            }}>
              BKU
            </span>
          </div>

          {/* RIGHT: User & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: '500',
              maxWidth: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {(session?.user as any)?.name || (session?.user as any)?.email?.split('@')[0] || 'Admin'}
            </div>

            <button
              onClick={() => window.location.href = '/api/auth/signout'}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '9px',
                fontWeight: '600',
                color: '#ef4444',
                cursor: 'pointer',
              }}
            >
              Abmelden
            </button>
          </div>
        </div>
      )}

      {/* HAUPT-CONTAINER */}
      <div style={{ 
        maxWidth: '1800px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: '2rem', 
        alignItems: 'flex-start', 
        paddingBottom: isMobile ? '0' : '2rem',
        paddingTop: isMobile ? '80px' : '0',
      }}>

        {/* SITZPLAN */}
        <div style={{ 
          flex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          overflow: isMobile ? 'auto' : 'visible',
          maxHeight: isMobile ? '700px' : 'none',
        }}>
          
          {/* SCALE WRAPPER */}
          <div style={{
            transform: isMobile ? 'scale(0.35)' : 'none',
            transformOrigin: isMobile ? 'top left' : 'center',
            width: isMobile ? '1800px' : 'auto',
            marginLeft: isMobile ? '20px' : '0',
          }}>
            
            <div style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.3)', 
              backdropFilter: 'blur(10px)', 
              borderRadius: '1rem', 
              padding: '2rem', 
              border: '1px solid rgba(255, 255, 255, 0.2)' 
            }}>

              {/* "Sitzplan (Admin-Modus)" Text - NUR auf Desktop */}
              {!isMobile && (
                <p style={{ 
                  color: 'white', 
                  marginBottom: '1.5rem', 
                  fontSize: '1.125rem', 
                  textAlign: 'center' 
                }}>
                  Sitzplan {isAdmin && <span style={{ color: '#d4af37' }}>(Admin-Modus)</span>}
                </p>
              )}

              {/* BÜHNE */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '600px', height: '200px', background: 'linear-gradient(180deg, rgba(90, 74, 66, 0.4) 0%, rgba(90, 74, 66, 0.2) 100%)', border: '2px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#d4af37', fontSize: '22px', fontWeight: '300', letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'Georgia, serif', textShadow: '0 2px 8px rgba(212, 175, 55, 0.3)' }}>Bühne</span>
                </div>
              </div>

              {/* HAUPT-CONTAINER */}
              <div style={{ position: 'relative' }}>

                {/* GALERIE-EBENE */}
                <div style={{ position: 'absolute', top: '-230px', left: 0, right: 0, bottom: 0 }}>

                  {/* LINKE GALERIE (BA, BB) */}
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '150px', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: '#d4af37', fontSize: '14px', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>GALERIE</div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {['BA', 'BB'].map(col => (
                        <div key={col} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem', width: '32px' }}>{col}</div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
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
                                    occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                                  />
                                ))}
                              </div>
                            ))}
                          </div>

                          <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', marginTop: '0.5rem', width: '32px' }}>{col}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RECHTE GALERIE (BC, BD) */}
                  <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '150px', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: '#d4af37', fontSize: '14px', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>GALERIE</div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {['BC', 'BD'].map(col => (
                        <div key={col} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem', width: '32px' }}>{col}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
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
                                    occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                          <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', marginTop: '0.5rem', width: '32px' }}>{col}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* UNTERE GALERIE (BM) */}
                  <div style={{ position: 'absolute', bottom: '20px', left: '200px', right: '200px', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>BM</div>

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
                            occupiedSeats={occupiedSeats}  // ⬅️ NEU!
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
                            occupiedSeats={occupiedSeats}  // ⬅️ NEU!
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
                            occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                          />
                        ))}
                      </div>

                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>BM</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>BM</div>
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
                            occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                          />
                        ))}
                      </div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>BM</div>
                    </div>
                  </div>
                </div>

                {/* PARKETT-EBENE */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 10rem 9rem 10rem', pointerEvents: 'none' }}>
                  <div style={{ pointerEvents: 'auto' }}>

                    {/* HAUPTREIHEN E-Y */}
                    {mainRows.map(({ letter, leftSeats, rightSeats }) => (
                      <Fragment key={letter}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px', gap: '20px' }}>
                          <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', width: '22px', textAlign: 'center', flexShrink: 0 }}>{letter}</div>

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
                                occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                              />
                            ))}
                          </div>

                          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', width: '35px', textAlign: 'center', flexShrink: 0, padding: '0 12px' }}>{letter}</div>

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
                                occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                              />
                            ))}
                          </div>

                          <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', width: '22px', textAlign: 'center', flexShrink: 0 }}>{letter}</div>
                        </div>

                        {letter === 'N' && <div style={{ height: '2rem' }}></div>}
                      </Fragment>
                    ))}

                    {/* HINTERE REIHEN Z-ZE */}
                    <div style={{ marginTop: '2px' }}>
                      {backRows.map(({ letter, leftRange, leftActual, rightRange, rightActual }) => (
                        <div key={letter} style={{ display: 'flex', alignItems: 'center', marginBottom: '2px', gap: '20px' }}>
                          <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', width: '22px', textAlign: 'center', flexShrink: 0 }}>{letter}</div>

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
                                    occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                                  />
                                ) : (
                                  <EmptySeat />
                                )}
                              </div>
                            ))}
                          </div>

                          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', width: '35px', textAlign: 'center', flexShrink: 0, padding: '0 12px' }}>{letter}</div>

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
                                    occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                                  />
                                ) : (
                                  <EmptySeat />
                                )}
                              </div>
                            ))}
                          </div>

                          <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', width: '22px', textAlign: 'center', flexShrink: 0 }}>{letter}</div>
                        </div>
                      ))}
                    </div>

                    {/* TREPPEN */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '1rem', marginBottom: '1rem', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '-70px' }}>
                        <div style={{ width: '292px', height: '8px', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '2px' }}></div>
                        <div style={{ width: '292px', height: '8px', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '2px' }}></div>
                        <div style={{ width: '292px', height: '8px', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '2px' }}></div>
                      </div>
                    </div>

                    {/* GANZ HINTERE REIHEN ZF-ZK */}
                    <div style={{ marginTop: '0px', position: 'relative' }}>
                      {veryBackRows.map(({ letter, leftActual, rightActual }) => (
                        <div key={letter} style={{ display: 'flex', alignItems: 'center', marginBottom: '2px', position: 'relative', height: '32px' }}>

                          <div style={{ position: 'absolute', left: '0px', color: 'white', fontSize: '16px', fontWeight: 'bold', width: '22px', textAlign: 'center' }}>{letter}</div>

                          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '130px', gap: '5px' }}>
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
                                    occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                                  />
                                ) : (
                                  <EmptySeat key={`${letter}-empty-${number}`} />
                                )
                              ))}
                            </div>

                            <div style={{ width: '20px' }}></div>

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
                                    occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                                  />
                                ) : (
                                  <EmptySeat key={`${letter}-empty-${number}`} />
                                )
                              ))}
                            </div>
                          </div>

                          <div style={{ position: 'absolute', left: '300px', color: 'white', fontSize: '20px', fontWeight: 'bold', width: '35px', textAlign: 'center', padding: '0 12px' }}>{letter}</div>

                          <div style={{ position: 'absolute', left: '360px', display: 'flex', gap: '0px' }}>
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
                                  occupiedSeats={occupiedSeats}  // ⬅️ NEU!
                                />
                              ) : (
                                <EmptySeat key={`${letter}-empty-${number}`} />
                              )
                            ))}
                          </div>

                          <div style={{ position: 'absolute', right: '0px', color: 'white', fontSize: '16px', fontWeight: 'bold', width: '22px', textAlign: 'center' }}>{letter}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

 {/* DESKTOP SIDEBAR - Nur auf Desktop rechts */}
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
              />
            ) : (
              <UserSidebar
                selectedSeats={selectedSeats}
                onRemoveSeat={handleRemoveSeat}
              />
            )}
          </>
        )}
      </div>

      {/* MOBILE CHECKOUT - für ALLE auf Mobile */}
      {isMobile && selectedSeats.length > 0 && (
        <>
          <MobileCheckoutButton
            selectedCount={selectedSeats.length}
            onClick={() => setCheckoutPanelOpen(true)}
          />

          <AnimatePresence>
            {checkoutPanelOpen && (
              <MobileCheckoutPanel
                isOpen={checkoutPanelOpen}
                onClose={() => setCheckoutPanelOpen(false)}
                selectedSeats={selectedSeats}
                onClearSeats={() => setSelectedSeats([])}
                isAdmin={isAdmin}
                onReserve={handleReserveClick}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}