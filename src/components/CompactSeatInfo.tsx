'use client';

import { X, User, Mail, Calendar, MapPin } from 'lucide-react';

interface CompactSeatInfoProps {
  seat: {
    row: string;
    number: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    createdAt?: string;
  } | null;
  onClose: () => void;
}

export default function CompactSeatInfo({ seat, onClose }: CompactSeatInfoProps) {
  if (!seat) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'   // ✅ RICHTIG
    });
  };

  return (
    <div style={{
      position: 'absolute',
      top: '2rem',
      left: '2rem',
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      minWidth: '320px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div>
          <h3 style={{ color: '#d4af37', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
            Sitzplatz reserviert
          </h3>
          <p style={{ color: 'white', fontSize: '1rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin style={{ width: '16px', height: '16px' }} />
            Reihe {seat.row}, Platz {seat.number}
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer' }}>
          <X style={{ width: '18px', height: '18px', color: 'white' }} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(seat.firstName || seat.lastName) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', borderRadius: '0.5rem', padding: '0.5rem' }}>
              <User style={{ width: '16px', height: '16px', color: '#d4af37' }} />
            </div>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', margin: '0 0 0.125rem 0' }}>Name</p>
              <p style={{ color: 'white', fontSize: '0.9375rem', fontWeight: '600', margin: 0 }}>
                {seat.firstName} {seat.lastName}
              </p>
            </div>
          </div>
        )}

        {seat.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem', padding: '0.5rem' }}>
              <Mail style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            </div>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', margin: '0 0 0.125rem 0' }}>E-Mail</p>
              <p style={{ color: 'white', fontSize: '0.875rem', margin: 0, wordBreak: 'break-all' }}>{seat.email}</p>
            </div>
          </div>
        )}

        {seat.createdAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem', padding: '0.5rem' }}>
              <Calendar style={{ width: '16px', height: '16px', color: '#10b981' }} />
            </div>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', margin: '0 0 0.125rem 0' }}>Reserviert am</p>
              <p style={{ color: 'white', fontSize: '0.875rem', margin: 0 }}>{formatDate(seat.createdAt)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
