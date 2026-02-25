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
  
  const [cameraReady, setCameraReady] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [manualInput, setManualInput] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);

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
    setCameraReady(false);
    setScanCount(0);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('Video element not found');

      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', '');
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      await video.play();
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('📹 Video ready:', video.videoWidth, 'x', video.videoHeight);

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Video hat keine Dimensionen');
      }

      setCameraReady(true);
      tick();

    } catch (err: any) {
      console.error('❌ Camera error:', err);
      setError('Kamera-Fehler: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
    setScanCount(0);
  };

  const tick = () => {
    if (!cameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(tick);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationRef.current = requestAnimationFrame(tick);
      return;
    }

    // Update canvas dimensions
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Increment scan counter
    const now = Date.now();
    if (now - lastScanTime > 1000) {
      setLastScanTime(now);
      setScanCount(prev => prev + 1);
    }
    
    // Try to decode QR with BOTH inversions
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (code && code.data) {
      console.log('🎯🎯🎯 QR ERKANNT:', code.data);
      console.log('Position:', code.location);
      validateTicket(code.data);
      return;
    }

    // Continue scanning
    animationRef.current = requestAnimationFrame(tick);
  };

  const validateTicket = async (qrData: string) => {
    console.log('🎫 Validiere:', qrData);
    stopCamera();
    setResult(null);
    setError(null);

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

        {/* Live Scan Counter */}
        {cameraReady && (
          <div style={{
            fontSize: '1rem',
            color: scanCount > 0 ? '#4ade80' : '#ef4444',
            marginBottom: '0.5rem',
            fontFamily: 'monospace',
            fontWeight: '700',
            animation: 'pulse 1s infinite'
          }}>
            🔄 Scanning... {scanCount} Sekunden
          </div>
        )}

        {/* Stats */}
        <div style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d4af37' }}>
              {stats.checkedIn}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              Eingecheckt
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              Verkauft
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4ade80' }}>
              {Math.round((stats.checkedIn / stats.total) * 100) || 0}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              Anwesend
            </div>
          </div>
        </div>

        {!cameraReady && !result && (
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
        )}

        {/* VIDEO CONTAINER */}
        <div style={{
          width: '100%',
          minHeight: cameraReady ? '500px' : '0px',
          background: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '1rem',
          position: 'relative',
          transition: 'min-height 0.3s'
        }}>
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          
          {cameraReady && (
            <>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '300px',
                height: '300px',
                border: '4px solid #d4af37',
                borderRadius: '20px',
                pointerEvents: 'none',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                animation: 'scan-pulse 2s ease-in-out infinite'
              }} />
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(74, 222, 128, 0.9)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                color: '#000'
              }}>
                📸 Halte QR-Code ruhig in den Rahmen
              </div>
            </>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <style jsx>{`
          @keyframes scan-pulse {
            0%, 100% {
              border-color: #d4af37;
              box-shadow: 0 0 0 9999px rgba(0,0,0,0.6);
            }
            50% {
              border-color: #4ade80;
              box-shadow: 0 0 0 9999px rgba(0,0,0,0.6), 0 0 20px #4ade80;
            }
          }
        `}</style>

        {cameraReady && !result && (
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
              marginBottom: '1rem'
            }}
          >
            ⏹ Stoppen
          </button>
        )}

        {/* Manual Input */}
        {!result && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '0.5rem'
            }}>
              Manuelle Eingabe (falls Scan nicht funktioniert):
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="QR-Code Inhalt..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem'
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
                ✓
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            padding: '2rem',
            background: result.valid 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
            border: `3px solid ${result.valid ? '#22c55e' : '#ef4444'}`,
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
              {result.valid ? '✅' : '❌'}
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: result.valid ? '#22c55e' : '#ef4444',
              marginBottom: '1rem'
            }}>
              {result.message}
            </div>
            {result.customer && (
              <div style={{
                fontSize: '1.25rem',
                color: 'white',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                {result.customer}
              </div>
            )}
            {result.seat && (
              <div style={{
                fontSize: '1.125rem',
                color: 'rgba(255,255,255,0.8)'
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