'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// @ts-ignore
import jsQR from 'jsqr';

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  
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
      stopCamera();
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

  const startCamera = async () => {
    setError(null);
    
    try {
      console.log('🎥 Starte Kamera...');
      
      // Request camera with specific constraints
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      console.log('✅ Stream erhalten');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata geladen');
          videoRef.current?.play().then(() => {
            console.log('▶️ Video spielt');
            setScanning(true);
            requestAnimationFrame(tick);
          }).catch(err => {
            console.error('Play error:', err);
            setError('Video konnte nicht gestartet werden: ' + err.message);
          });
        };

        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          setError('Video-Fehler aufgetreten');
        };
      }

    } catch (err: any) {
      console.error('❌ Kamera-Fehler:', err);
      let errorMsg = 'Kamera-Zugriff fehlgeschlagen';
      
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Kamera-Berechtigung verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'Keine Kamera gefunden';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Kamera wird bereits verwendet';
      }
      
      setError(errorMsg);
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stoppe Kamera');
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track gestoppt:', track.label);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !scanning) {
      console.log('Tick abgebrochen:', { video: !!video, canvas: !!canvas, scanning });
      return;
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        console.log('✅ QR Code gefunden:', code.data);
        validateTicket(code.data);
        return; // Stop scanning
      }
    }

    animationRef.current = requestAnimationFrame(tick);
  };

  const validateTicket = async (qrData: string) => {
    console.log('🎫 Validiere:', qrData);
    stopCamera();
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
      console.log('📋 Ergebnis:', data);
      setResult(data);
      fetchStats();

      setTimeout(() => {
        setResult(null);
        startCamera();
      }, 3000);

    } catch (err: any) {
      console.error('Validierungs-Fehler:', err);
      setError('Validierungs-Fehler: ' + err.message);
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
              onClick={startCamera}
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
              padding: '1rem'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.5rem'
              }}>
                Manuelle Eingabe:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="z.B. 5014-abc123"
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
            <div style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#000'
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  maxHeight: '60vh',
                  display: 'block',
                  objectFit: 'cover'
                }}
              />
              
              {/* Scan Frame Overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '250px',
                height: '250px',
                border: '3px solid #d4af37',
                borderRadius: '12px',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
              }} />
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <button
              onClick={stopCamera}
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
              ⏹ Stoppen
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
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}