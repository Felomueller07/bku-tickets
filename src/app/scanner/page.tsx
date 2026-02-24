'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin');
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchStats();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/seats');
      const seats = await res.json();
      const paid = seats.filter((s: any) => s.status === 'paid');
      const checkedIn = paid.filter((s: any) => s.checkedIn);
      setStats({ total: paid.length, checkedIn: checkedIn.length });
    } catch (err) {
      console.error('Stats Fehler:', err);
    }
  };

  const startScanner = async () => {
    try {
      // Check if already initialized
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // Get available cameras first
      const devices = await Html5Qrcode.getCameras();
      
      if (!devices || devices.length === 0) {
        throw new Error('Keine Kamera gefunden');
      }

      // Use back camera (usually index 0 or last)
      const cameraId = devices[devices.length - 1].id;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          console.log('QR gefunden:', decodedText);
          validateTicket(decodedText);
        },
        (errorMessage) => {
          // Scan errors ignorieren (passiert ständig)
        }
      );

      setScanning(true);
      setError(null);
    } catch (err: any) {
      console.error('Scanner Error:', err);
      setError('Kamera-Zugriff fehlgeschlagen. Bitte erlaube Kamera-Zugriff in den Browser-Einstellungen.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Stop error:', err);
      }
    }
    setScanning(false);
  };

  const validateTicket = async (qrData: string) => {
    if (!scanning && !qrData) return;
    
    if (scanning) {
      await stopScanner();
    }
    
    setResult(null);
    setError(null);
    setManualInput('');

    try {
      const res = await fetch('/api/validate-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData })
      });

      const data = await res.json();
      setResult(data);
      fetchStats();

      setTimeout(() => {
        setResult(null);
        if (scanning) startScanner();
      }, 3000);

    } catch (err) {
      setError('Validierungs-Fehler');
      console.error(err);
    }
  };

  if (status === 'loading') {
    return <div style={{ padding: '2rem', color: 'white' }}>Lädt...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      padding: '1rem',
      color: 'white'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#d4af37',
          marginBottom: '0.5rem'
        }}>
          Ticket Scanner
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
          Josefi Konzert 2026
        </p>

        {/* Stats */}
        <div style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-around'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d4af37' }}>
              {stats.checkedIn}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
              Eingecheckt
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
              Verkauft
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80' }}>
              {Math.round((stats.checkedIn / stats.total) * 100) || 0}%
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
              Anwesend
            </div>
          </div>
        </div>

        {/* Scanner */}
        {!scanning && !result && (
          <>
            <button
              onClick={startScanner}
              style={{
                width: '100%',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#0a0a0a',
                fontSize: '1.25rem',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              📷 Scanner starten
            </button>

            {/* Manual Input */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.5rem'
              }}>
                Manuelle Eingabe (z.B. 5014-abc123):
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Ticket-ID eingeben..."
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={() => validateTicket(manualInput)}
                  disabled={!manualInput}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: manualInput ? '#d4af37' : 'rgba(212,175,55,0.3)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000',
                    fontWeight: '600',
                    cursor: manualInput ? 'pointer' : 'not-allowed'
                  }}
                >
                  Prüfen
                </button>
              </div>
            </div>
          </>
        )}

        {scanning && (
          <div style={{ marginBottom: '1rem' }}>
            <div 
              id="qr-reader" 
              style={{
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            />
            <button
              onClick={stopScanner}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.9)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Stoppen
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            padding: '2rem',
            background: result.valid 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
            border: `2px solid ${result.valid ? '#22c55e' : '#ef4444'}`,
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {result.valid ? '✅' : '❌'}
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: result.valid ? '#22c55e' : '#ef4444',
              marginBottom: '1rem'
            }}>
              {result.message}
            </div>
            {result.customer && (
              <div style={{
                fontSize: '1.125rem',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {result.customer}
              </div>
            )}
            {result.seat && (
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.7)'
              }}>
                {result.seat}
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            color: '#ef4444',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
