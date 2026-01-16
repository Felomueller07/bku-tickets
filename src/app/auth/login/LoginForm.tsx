'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

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
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '3rem',
          maxWidth: '450px',
          width: '100%',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
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
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#ef4444',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
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
                color: 'rgba(255, 255, 255, 0.5)',
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
                }}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
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
                color: 'rgba(255, 255, 255, 0.5)',
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
                }}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
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
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            }}
          >
            Jetzt registrieren
          </button>
        </p>

        <button
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
          }}
        >
          ← Zurück zur Startseite
        </button>
      </motion.div>
    </div>
  );
}
