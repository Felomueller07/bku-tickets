'use client';

import { useState, Fragment, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import SeatDetailsModal from './SeatDetailsModal';
import AdminSidebar from './AdminSidebar';
import UserSidebar from './UserSidebar';
import MobileCheckoutButton from './MobileCheckoutButton';
import MobileCheckoutPanel from './MobileCheckoutPanel';
import ReleaseConfirmModal from './ReleaseConfirmModal';
import CheckoutModal from './CheckoutModal';

// ⭐ LOCK-SYSTEM: Session ID generieren
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

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
  isLockedByOther,
  onToggleSelect,
  occupiedSeats,
}: {
  row: string;
  number: number;
  rotation?: number;
  isOccupied: boolean;
  isSelected: boolean;
  isAdmin: boolean;
  isLockedByOther: boolean;
  onToggleSelect: (row: string, number: number) => void;
  occupiedSeats: Array<{
    row: string;
    number: number;
    reservationType?: string | null;
    status?: string;
  }>;
}) {

  const handleClick = () => {
    onToggleSelect(row, number);
  };

  const getColor = () => {
    // LOCKED BY OTHER (Hard Lock) = DUNKELGRAU
    if (isLockedByOther && !isAdmin) {
      return '#6b7280';
    }

    // ADMIN SICHT
    if (isAdmin) {
      if (isOccupied && isSelected) {
        return '#7c2d12';
      }
      
      if (isOccupied) {
        const seat = occupiedSeats.find(s => s.row === row && s.number === number);
        
        switch (seat?.reservationType) {
          case 'admin':
            return '#f97316';
          case 'voucher':
            return '#089383';
          case 'marked':
            return '#facc15';
          case 'user':
            return '#ef4444';
          default:
            return '#ef4444';
        }
      }
      
      if (isSelected) {
        return '#4ade80';
      }
      
      return '#e8e8e8';
    }
    
    // USER SICHT
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

  const isDisabled = (isOccupied || isLockedByOther) && !isAdmin;

  return (
    <motion.svg
      width="32"
      height="32"
      viewBox="0 0 50 50"
      onClick={handleClick}
      style={{
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        marginLeft: rotation === 0 ? '-6px' : '0',
        marginRight: rotation === 0 ? '-6px' : '0',
        marginTop: rotation !== 0 ? '-6px' : '0',
        marginBottom: rotation !== 0 ? '-6px' : '0',
        opacity: isLockedByOther ? 0.7 : 1,
      }}
      animate={{ rotate: rotation }}
      whileHover={{ scale: isDisabled ? 1 : 1.15, zIndex: 10, rotate: rotation }}
      whileTap={{ scale: isDisabled ? 1 : 0.95, rotate: rotation }}
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

      {(isOccupied || isLockedByOther) && (
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
function EmptySeat() {
  return (
    <div style={{ width: '32px', height: '32px', marginLeft: '-6px', marginRight: '-6px' }}></div>
  );
}

// ========================================
// HAUPTKOMPONENTE: SITZPLAN MIT HARD-LOCK ONLY
// ========================================
export default function SeatMap() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

const [sessionId] = useState(() => {
  // Check ob SessionId schon in localStorage existiert
  const stored = localStorage.getItem('bku-session-id');
  if (stored) {
    console.log('🔄 Bestehende Session wiederhergestellt:', stored);
    return stored;
  }
  // Neue Session generieren und speichern
  const newId = generateSessionId();
  localStorage.setItem('bku-session-id', newId);
  console.log('✨ Neue Session erstelslt:', newId);
  return newId;
});
  const [selectedSeats, setSelectedSeats] = useState<Array<{ row: string; number: number; id?: number }>>([]);

  const [occupiedSeats, setOccupiedSeats] = useState<Array<{
    id: number;
    row: string;
    number: number;
    status: string;
    sessionId?: string | null;
    lockExpiry?: Date | null;
    firstName?: string;
    lastName?: string;
    email?: string;
    note?: string;
    createdAt?: string;
    userId?: number;
    reservationType?: string | null;
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
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [checkoutPanelOpen, setCheckoutPanelOpen] = useState(false);
  
  // ⭐ CHECKOUT MODAL STATE - HIER IM SEATMAP!
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    loadSeats();

    const interval = setInterval(() => {
      loadSeats();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        await fetch('/api/seats/cleanup', { method: 'POST' });
        console.log('🧹 Cleanup durchgeführt');
      } catch (error) {
        console.error('❌ Cleanup Fehler:', error);
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
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
          id: seat.id,
          row: seat.row,
          number: seat.number,
          status: seat.status,
          sessionId: seat.sessionId,
          lockExpiry: seat.lockExpiry ? new Date(seat.lockExpiry) : null,
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          email: seat.email || '',
          note: seat.note || '',
          createdAt: seat.createdAt,
          userId: seat.userId,
          user: seat.user,
          reservationType: seat.reservationType,
        }));

 setOccupiedSeats(mappedSeats);
        
        // ⭐ EIGENE LOCKED SITZE AUTOMATISCH WIEDERHERSTELLEN
        const myLockedSeats = mappedSeats.filter((seat: any) => 
          seat.status === 'locked' && 
          seat.sessionId === sessionId &&
          seat.lockExpiry && 
          new Date(seat.lockExpiry) > new Date()
        );

        if (myLockedSeats.length > 0) {
          setSelectedSeats(myLockedSeats.map((s: any) => ({ 
            row: s.row, 
            number: s.number,
            id: s.id 
          })));
          console.log('🔄 Deine gesperrten Sitze wiederhergestellt:', myLockedSeats.length);
        }
        
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden:', error);
      setLoading(false);
    }
  };

  const handleToggleSelect = async (row: string, number: number) => {
    const isCurrentlySelected = selectedSeats.some(s => s.row === row && s.number === number);
    const seat = occupiedSeats.find(s => s.row === row && s.number === number);
    
    const isHardLockedByOther = seat?.status === 'locked' && 
                                seat.sessionId !== sessionId && 
                                seat.lockExpiry && 
                                new Date(seat.lockExpiry) > new Date();

    if (!isAdmin && (seat?.status === 'reserved' || seat?.status === 'marked' || isHardLockedByOther)) {
      if (isHardLockedByOther) {
        toast.error(`Sitz ${row}${number} ist bereits im Checkout`, { duration: 2000 });
      } else {
        toast.error(`Sitz ${row}${number} ist bereits reserviert`, { duration: 2000 });
      }
      return;
    }

    if (isCurrentlySelected) {
      setSelectedSeats(selectedSeats.filter(s => !(s.row === row && s.number === number)));
      toast.info(`Sitz ${row}${number} abgewählt`, { duration: 1500 });
    } else {
      setSelectedSeats([...selectedSeats, { row, number, id: seat?.id }]);
      toast.success(`Sitz ${row}${number} ausgewählt`, { duration: 1500 });
    }
    
    setTimeout(() => loadSeats(), 300);
  };

const isSeatOccupied = (row: string, number: number) => {
  const seat = occupiedSeats.find(s => s.row === row && s.number === number);
  return seat?.status === 'reserved' || seat?.status === 'marked' || seat?.status === 'paid';
};

  const isSeatLockedByOther = (row: string, number: number) => {
    const seat = occupiedSeats.find(s => s.row === row && s.number === number);
    
    if (!seat || seat.status !== 'locked') return false;
    if (seat.sessionId === sessionId) return false;
    if (!seat.lockExpiry) return false;
    
    return new Date(seat.lockExpiry) > new Date();
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

  const handleMarkClick = async () => {
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
      const response = await fetch('/api/seats/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: freeSeats.map(s => ({
            row: s.row,
            number: s.number,
          }))
        })
      });

      if (response.ok) {
        await loadSeats();
        setSelectedSeats([]);
        toast.success(`${freeSeats.length} Sitz(e) vorgemerkt`, { duration: 2000 });
      } else {
        toast.error('Fehler beim Vormerken');
      }
    } catch (error) {
      console.error('Fehler:', error);
      toast.error('Fehler beim Vormerken');
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

  const handleAdminReleaseClick = () => {
    if (selectedSeats.length === 0) {
      toast.error('Keine Sitze ausgewählt');
      return;
    }

    const occupiedSelected = selectedSeats.filter(s => isSeatOccupied(s.row, s.number));

    if (occupiedSelected.length === 0) {
      toast.error('Nur freie Sitze ausgewählt');
      return;
    }

    setReleaseModalOpen(true);
  };

  const handleAdminReleaseConfirm = async () => {
    const occupiedSelected = selectedSeats.filter(s => isSeatOccupied(s.row, s.number));

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

  const handleRemoveSeat = (row: string, number: number) => {
    setSelectedSeats(prev => prev.filter(s => !(s.row === row && s.number === number)));
    setTimeout(() => loadSeats(), 300);
  };

  // ⭐ CHECKOUT MODAL HANDLER - HIER IM SEATMAP!
  const handleModalClose = async () => {
    setIsCheckoutOpen(false);
    
    try {
      await fetch('/api/seats/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (error) {
      console.error('❌ Unlock Fehler:', error);
    }
  };

  const handleCheckout = async (seatsWithData: any[], voucherCodes?: string[]) => {
    try {
      // ⭐ VOUCHER-LOGIK
      if (voucherCodes && voucherCodes.length > 0) {
        const voucherSeats = seatsWithData.slice(0, voucherCodes.length);
        
        // Voucher-Sitze direkt reservieren (kostenlos)
        const reserveResponse = await fetch('/api/seats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            seats: voucherSeats.map((s, i) => ({ ...s, voucherCode: voucherCodes[i] }))
          }),
        });
        
        if (!reserveResponse.ok) throw new Error('Voucher-Reservierung fehlgeschlagen');
        
        // Voucher als verwendet markieren
        for (const code of voucherCodes) {
          await fetch('/api/voucher/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
        }
        
        // Wenn ALLE Sitze mit Vouchers bezahlt → zurück zu Dashboard
        if (voucherCodes.length >= seatsWithData.length) {
          window.location.href = '/dashboard';
          return;
        }
        
        // Rest geht zu Stripe (ohne /api/seats!)
        const seatsToPayFor = seatsWithData.slice(voucherCodes.length);
        const checkoutResponse = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seats: seatsToPayFor }),
        });
        const { url } = await checkoutResponse.json();
        if (url) window.location.href = url;
        return;
      }
      
      // ⭐ NORMALE ZAHLUNG - DIREKT ZU STRIPE, KEIN /api/seats!
      const checkoutResponse = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: seatsWithData }),
      });
      
      const { url } = await checkoutResponse.json();
      if (url) window.location.href = url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Fehler beim Checkout');
    }
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
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Lade Sitzplan...</div>
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

      <ReleaseConfirmModal
        isOpen={releaseModalOpen}
        onClose={() => setReleaseModalOpen(false)}
        onConfirm={handleAdminReleaseConfirm}
        seatCount={selectedSeats.filter(s => isSeatOccupied(s.row, s.number)).length}
      />

      {/* ⭐ CHECKOUT MODAL - HIER IM SEATMAP GERENDERT! */}
      <CheckoutModal
        selectedSeats={selectedSeats}
        isOpen={isCheckoutOpen}
        onClose={handleModalClose}
        onCheckout={handleCheckout}
        sessionId={sessionId}
      />

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
              {(session?.user as any)?.name || (session?.user as any)?.email?.split('@')[0] || 'Gast'}
            </div>

            {session && (
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
            )}
          </div>
        </div>
      )}

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

        <div style={{ 
          flex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          overflow: isMobile ? 'auto' : 'visible',
          maxHeight: isMobile ? '700px' : 'none',
        }}>
          
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

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '600px', height: '200px', background: 'linear-gradient(180deg, rgba(90, 74, 66, 0.4) 0%, rgba(90, 74, 66, 0.2) 100%)', border: '2px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#d4af37', fontSize: '22px', fontWeight: '300', letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'Georgia, serif', textShadow: '0 2px 8px rgba(212, 175, 55, 0.3)' }}>Bühne</span>
                </div>
              </div>

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
                                    isLockedByOther={isSeatLockedByOther(col, seatNum)}
                                    onToggleSelect={handleToggleSelect}
                                    occupiedSeats={occupiedSeats}
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
                                    isLockedByOther={isSeatLockedByOther(col, seatNum)}
                                    onToggleSelect={handleToggleSelect}
                                    occupiedSeats={occupiedSeats}
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
                            isLockedByOther={isSeatLockedByOther('BM', num)}
                            onToggleSelect={handleToggleSelect}
                            occupiedSeats={occupiedSeats}
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
                            isLockedByOther={isSeatLockedByOther('BM', num)}
                            onToggleSelect={handleToggleSelect}
                            occupiedSeats={occupiedSeats}
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
                            isLockedByOther={isSeatLockedByOther('BM', num)}
                            onToggleSelect={handleToggleSelect}
                            occupiedSeats={occupiedSeats}
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
                            isLockedByOther={isSeatLockedByOther('BM', num)}
                            onToggleSelect={handleToggleSelect}
                            occupiedSeats={occupiedSeats}
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
                                isLockedByOther={isSeatLockedByOther(letter, number)}
                                onToggleSelect={handleToggleSelect}
                                occupiedSeats={occupiedSeats}
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
                                isLockedByOther={isSeatLockedByOther(letter, number)}
                                onToggleSelect={handleToggleSelect}
                                occupiedSeats={occupiedSeats}
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
                                    isLockedByOther={isSeatLockedByOther(letter, number)}
                                    onToggleSelect={handleToggleSelect}
                                    occupiedSeats={occupiedSeats}
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
                                    isLockedByOther={isSeatLockedByOther(letter, number)}
                                    onToggleSelect={handleToggleSelect}
                                    occupiedSeats={occupiedSeats}
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
                                    isLockedByOther={isSeatLockedByOther(letter, number)}
                                    onToggleSelect={handleToggleSelect}
                                    occupiedSeats={occupiedSeats}
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
                                    isLockedByOther={isSeatLockedByOther(letter, number)}
                                    onToggleSelect={handleToggleSelect}
                                    occupiedSeats={occupiedSeats}
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
                                  isLockedByOther={isSeatLockedByOther(letter, number)}
                                  onToggleSelect={handleToggleSelect}
                                  occupiedSeats={occupiedSeats}
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

        {/* DESKTOP SIDEBAR */}
        {!isMobile && (
          <>
            {isAdmin ? (
              <AdminSidebar
                selectedSeats={selectedSeats}
                occupiedSeats={occupiedSeats}
                isSeatOccupied={isSeatOccupied}
                onReserve={handleReserveClick}
                onRelease={handleAdminReleaseClick}
                onMark={handleMarkClick}
                onSeatClick={handleSidebarSeatClick}
                onAddDataClick={handleAddDataClick}
              />
            ) : (
              <UserSidebar
                selectedSeats={selectedSeats}
                onRemoveSeat={handleRemoveSeat}
                sessionId={sessionId}
              />
            )}
          </>
        )}
      </div>

      {/* MOBILE CHECKOUT */}
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
                sessionId={sessionId}
                isAdmin={isAdmin}
                onReserve={handleReserveClick}
                onMark={handleMarkClick}
                 onOpenCheckout={() => {
    setCheckoutPanelOpen(false);
    setIsCheckoutOpen(true);
      }}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}