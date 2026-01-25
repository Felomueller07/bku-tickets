'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Image from 'next/image';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Bitte geben Sie den vollständigen Code ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verifizierung fehlgeschlagen');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Code konnte nicht erneut gesendet werden');
      }

      alert('Code wurde erneut gesendet!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        padding: isMobile ? '1rem' : '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.5rem',
            padding: isMobile ? '2rem' : '3rem',
            maxWidth: '450px',
            width: '100%',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <CheckCircle style={{ width: '64px', height: '64px', color: '#10b981', margin: '0 auto 1.5rem' }} />
          <h2 style={{ color: '#10b981', fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '1rem' }}>
            Erfolgreich verifiziert!
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: isMobile ? '0.875rem' : '1rem' }}>
            Sie werden zum Login weitergeleitet...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: isMobile ? '1rem' : '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Beleuchtungseffekte */}
      <div style={{
        position: 'fixed',
        top: '-25%',
        right: '-15%',
        width: isMobile ? '600px' : '1000px',
        height: isMobile ? '600px' : '1000px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.15) 30%, transparent 70%)',
        filter: 'blur(120px)',
        zIndex: 0,
      }} />

      <div style={{
        position: 'fixed',
        top: '5%',
        right: '10%',
        width: isMobile ? '400px' : '600px',
        height: isMobile ? '400px' : '600px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, transparent 70%)',
        filter: 'blur(90px)',
        zIndex: 0,
      }} />

      <div style={{
        position: 'fixed',
        bottom: '-25%',
        left: '-15%',
        width: isMobile ? '600px' : '900px',
        height: isMobile ? '600px' : '900px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
        filter: 'blur(110px)',
        zIndex: 0,
      }} />

      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '5%',
        width: isMobile ? '300px' : '500px',
        height: isMobile ? '300px' : '500px',
        background: 'radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          padding: isMobile ? '2rem 1.5rem' : '3rem',
          maxWidth: '450px',
          width: '100%',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* BKU Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            position: 'relative',
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            margin: isMobile ? '0 auto 1rem' : '0 auto 1.5rem',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <Image
            src="/bku-logo.png"
            alt="BKU"
            fill
            style={{ objectFit: 'cover' }}
          />
        </motion.div>

        <h1 style={{
          color: '#d4af37',
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}>
          E-Mail bestätigen
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: isMobile ? '0.75rem' : '0.875rem',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          textAlign: 'center',
        }}>
          Wir haben einen 6-stelligen Code an<br />
          <strong style={{ color: '#d4af37' }}>{email}</strong> gesendet
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              padding: isMobile ? '0.75rem' : '1rem',
              marginBottom: '1.5rem',
              color: '#ef4444',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            gap: isMobile ? '0.5rem' : '0.75rem',
            justifyContent: 'center',
            marginBottom: isMobile ? '1.5rem' : '2rem',
          }}>
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                  width: isMobile ? '2.5rem' : '3.5rem',
                  height: isMobile ? '2.5rem' : '3.5rem',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '0.75rem',
                  color: '#d4af37',
                  outline: 'none',
                  transition: 'all 0.3s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4af37';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: isMobile ? '0.875rem' : '1rem',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#000',
              fontSize: isMobile ? '0.875rem' : '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.3s',
              marginBottom: '1rem',
            }}
          >
            {loading ? 'Wird überprüft...' : 'Bestätigen'}
          </motion.button>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            style={{
              width: '100%',
              padding: isMobile ? '0.75rem' : '0.875rem',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            Code erneut senden
          </button>
        </form>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/auth/register')}
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: isMobile ? '0.625rem' : '0.75rem',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          <ArrowLeft size={isMobile ? 14 : 16} />
          Zurück zur Registrierung
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}