'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import UserSidebar from './UserSidebar';

interface Seat {
  row: string;
  number: number;
  status: 'available' | 'reserved' | 'paid';
  firstName?: string | null;
  lastName?: string | null;
  userId?: number | null;
}

interface SeatMapProps {
  isAdmin: boolean;
  userId?: number;
}

export default function SeatMap({ isAdmin, userId }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 12;

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const response = await fetch('/api/seats');
      const data = await response.json();
      setSeats(data);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Fehler beim Laden der Sitzplätze');
    } finally {
      setLoading(false);
    }
  };

  const getSeatStatus = (row: string, number: number): Seat | undefined => {
    return seats.find(s => s.row === row && s.number === number);
  };

  const getSeatColor = (seat: Seat | undefined, isSelected: boolean) => {
    if (!seat) return '#e8e8e8';
    
    if (isSelected) {
      if (seat.status === 'reserved' || seat.status === 'paid') {
        return '#b91c1c';
      }
      return '#4ade80';
    }
    
    if (seat.status === 'reserved' || seat.status === 'paid') {
      return '#ef4444';
    }
    
    return '#e8e8e8';
  };

  const handleSeatClick = (row: string, number: number) => {
    const seatStatus = getSeatStatus(row, number);
    
    if (seatStatus && (seatStatus.status === 'reserved' || seatStatus.status === 'paid')) {
      toast.error('Dieser Platz ist bereits belegt');
      return;
    }

    const isAlreadySelected = selectedSeats.some(s => s.row === row && s.number === number);
    
    if (isAlreadySelected) {
      setSelectedSeats(prev => prev.filter(s => !(s.row === row && s.number === number)));
    } else {
      const firstName = prompt('Vorname:');
      if (!firstName) return;
      
      const lastName = prompt('Nachname:');
      if (!lastName) return;

      setSelectedSeats(prev => [...prev, { row, number, firstName, lastName }]);
      toast.success(`Platz ${row}${number} ausgewählt`);
    }
  };

  const handleRemoveSeat = (row: string, number: number) => {
    setSelectedSeats(prev => prev.filter(s => !(s.row === row && s.number === number)));
    toast.success(`Platz ${row}${number} entfernt`);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'white',
      }}>
        Lädt...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#1a1a1a',
    }}>
      <div style={{
        flex: 1,
        padding: '2rem',
        overflowY: 'auto',
      }}>
        <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '2rem' }}>
          Sitzplatzauswahl
        </h1>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {rows.map(row => (
            <div key={row} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: 'white', width: '30px', fontWeight: '600' }}>{row}</span>
              {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map(number => {
                const seatStatus = getSeatStatus(row, number);
                const isSelected = selectedSeats.some(s => s.row === row && s.number === number);
                const color = getSeatColor(seatStatus, isSelected);
                
                return (
                  <button
                    key={number}
                    onClick={() => handleSeatClick(row, number)}
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: color,
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: (seatStatus?.status === 'reserved' || seatStatus?.status === 'paid') ? 'not-allowed' : 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#000',
                      transition: 'all 0.2s',
                    }}
                  >
                    {number}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <UserSidebar
        selectedSeats={selectedSeats}
        onRemoveSeat={handleRemoveSeat}
      />
    </div>
  );
}
