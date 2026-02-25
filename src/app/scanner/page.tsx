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
  const intervalRef = useRef<any>(null);
  
  const [cameraReady, setCameraReady] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [manualInput, setManualInput] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLog(prev => [...prev.slice(-5), msg]);
  };

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
    setDebugLog([]);
    addLog('🎥 Starting camera...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      addLog('✅ Stream obtained');
      streamRef.current = stream;
      const video = videoRef.current;
      
      if (!video) {
        throw new Error('Video ref null');
      }

      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('autoplay', 'true');
      video.setAttribute('muted', 'true');

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          addLog(`📹 Metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
          resolve(true);
        };
      });

      await video.play();
      addLog('▶️ Video playing');
      
      await new Promise(r => setTimeout(r, 500));

      if (video.videoWidth === 0) {
        throw new Error('Video width is 0');
      }

      setCameraReady(true);
      addLog('✅ Camera ready - starting scan loop');
      
      // Start interval-based scanning
      intervalRef.current = setInterval(() => {
        scanFrame();
      }, 200); // 5 FPS

    } catch (err: any) {
      addLog('❌ ERROR: ' + err.message);
      setError(err.message);
    }
  };

  const stopCamera = () => {
    addLog('🛑 Stopping camera');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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

  const scanFrame = () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        addLog('❌ Missing refs');
        return;
      }

      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Resize canvas if needed
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        addLog(`📐 Canvas: ${canvas.width}x${canvas.height}`);
      }

      // Draw and scan
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      setScanCount(c => c + 1);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });

      if (code?.data) {
        addLog('🎯 QR FOUND: ' + code.data);
        validateTicket(code.data);
      }

    } catch (err: any) {
      addLog('⚠️ Scan error: ' + err.message);
    }
  };

  const validateTicket = async (qrData: string) => {
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
      setResult(data);
      fetchStats();

      setTimeout(() => {
        setResult(null);
        startCamera();
      }, 3000);

    } catch (err: any) {
      setError('Validierung fehlgeschlagen: ' + err.message);
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

        {/* SCAN STATUS */}
        {cameraReady && (
          <div style={{
            fontSize: '1.5rem',
            color: scanCount > 0 ? '#4ade80' : '#ef4444',
            marginBottom: '0.5rem',
            fontFamily: 'monospace',
            fontWeight: '700',
            textAlign: 'center',
            padding: '0.5rem',
            background: scanCount > 0 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            borderRadius: '8px'
          }}>
            {scanCount > 0 ? `✅ AKTIV - Scans: ${scanCount}` : '❌ NICHT AKTIV'}
          </div>
        )}

        {/* DEBUG LOG */}
        {debugLog.length > 0 && (
          <div style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.5)',
            padding: '0.5rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            maxHeight: '100px',
            overflow: 'auto'
          }}>
            {debugLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
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

        {/* VIDEO */}
        <div style={{
          width: '100%',
          minHeight: cameraReady ? '500px' : '0px',
          background: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '1rem',
          position: 'relative'
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
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '350px',
              height: '350px',
              border: '6px solid #4ade80',
              borderRadius: '24px',
              pointerEvents: 'none',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7), 0 0 40px #4ade80'
            }} />
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

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
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
              Falls Scanner nicht funktioniert:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="QR-Code Inhalt einfügen..."
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
                OK
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            padding: '2.5rem',
            background: result.valid 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)',
            border: `4px solid ${result.valid ? '#22c55e' : '#ef4444'}`,
            borderRadius: '16px',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>
              {result.valid ? '✅' : '❌'}
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: result.valid ? '#22c55e' : '#ef4444',
              marginBottom: '1rem'
            }}>
              {result.message}
            </div>
            {result.customer && (
              <div style={{
                fontSize: '1.5rem',
                color: 'white',
                marginBottom: '0.75rem',
                fontWeight: '600'
              }}>
                {result.customer}
              </div>
            )}
            {result.seat && (
              <div style={{
                fontSize: '1.25rem',
                color: 'rgba(255,255,255,0.9)'
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