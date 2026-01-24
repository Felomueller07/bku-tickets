'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  console.log('🔍 Login attempt:', { email, password }); // DEBUG

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    console.log('✅ SignIn result:', result); // DEBUG

    if (result?.error) {
      console.log('❌ Error:', result.error); // DEBUG
      setError('Ungültige E-Mail oder Passwort');
    } else {
      console.log('✅ Login successful!'); // DEBUG
      router.push('/dashboard');
      router.refresh();
    }
  } catch (err) {
    console.log('❌ Catch error:', err); // DEBUG
    setError('Ein Fehler ist aufgetreten');
  } finally {
    setLoading(false);
  }
};
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Ungültige E-Mail oder Passwort');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Starke Orange-Beleuchtung rechts oben */}
      <div style={{
        position: 'fixed',
        top: '-25%',
        right: '-15%',
        width: '1000px',
        height: '1000px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.15) 30%, transparent 70%)',
        filter: 'blur(120px)',
        zIndex: 0,
      }} />

      {/* Zusätzliche Orange-Schicht */}
      <div style={{
        position: 'fixed',
        top: '5%',
        right: '10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, transparent 70%)',
        filter: 'blur(90px)',
        zIndex: 0,
      }} />
      
      {/* Starke Blau-Beleuchtung links unten */}
      <div style={{
        position: 'fixed',
        bottom: '-25%',
        left: '-15%',
        width: '900px',
        height: '900px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
        filter: 'blur(110px)',
        zIndex: 0,
      }} />

      {/* Zusätzliche Blau-Schicht */}
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '5%',
        width: '500px',
        height: '500px',
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
          padding: '3rem',
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
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
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
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}>
          Anmelden
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.875rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          Josefi Konzert 2026
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#ef4444',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}>
              E-Mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: email ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
                transition: 'color 0.3s',
              }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4af37';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}>
              Passwort
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: password ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
                transition: 'color 0.3s',
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 3rem 0.75rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4af37';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              />
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  style={{
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: password ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    transition: 'color 0.3s',
  }}
  onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
  onMouseLeave={(e) => e.currentTarget.style.color = password ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)'}
>
  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
</button>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(100, 116, 139, 0.1)',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              margin: 0,
              fontWeight: '500',
            }}>
              Demo Login:
            </p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.75rem',
              margin: '0.25rem 0 0 0',
            }}>
              Admin: admin@bku.com / admin123
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#000',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.3s',
            }}
          >
            {loading ? (
              'Anmeldung läuft...'
            ) : (
              <>
                <LogIn size={18} />
                Anmelden
              </>
            )}
          </motion.button>
        </form>

        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.875rem',
          marginTop: '1.5rem',
          textAlign: 'center',
        }}>
          Noch kein Konto?{' '}
          <button
            onClick={() => router.push('/auth/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af37',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '500',
            }}
          >
            Jetzt registrieren
          </button>
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875rem',
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
          <ArrowLeft size={16} />
          Zurück zur Startseite
        </motion.button>
      </motion.div>
    </div>
  );
}