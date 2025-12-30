'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams?.get('registered');

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
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* HINTERGRUNDBILD */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/kapelle.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px)',
        opacity: 0.3,
      }} />

      {/* GRADIENT OVERLAY */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
        }}
      >
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}>
          <h1 style={{
            color: 'white',
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

          {registered && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                color: '#4ade80',
                fontSize: '0.875rem',
                margin: 0,
              }}>
                ✅ Registrierung erfolgreich! Du kannst dich jetzt anmelden.
              </p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                color: '#ef4444',
                fontSize: '0.875rem',
                margin: 0,
              }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}>
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}>
                Passwort
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 3rem 0.75rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
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
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '18px', height: '18px', color: 'rgba(255, 255, 255, 0.5)' }} />
                  ) : (
                    <Eye style={{ width: '18px', height: '18px', color: 'rgba(255, 255, 255, 0.5)' }} />
                  )}
                </button>
              </div>
            </div>

            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
                margin: 0,
                marginBottom: '0.25rem',
              }}>
                <strong>Demo Login:</strong>
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem',
                margin: 0,
              }}>
                Admin: admin@bku.com / admin123
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading
                  ? 'rgba(212, 175, 55, 0.5)'
                  : 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '1rem',
              }}
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </motion.button>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => router.push('/auth/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d4af37',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Noch kein Konto? Jetzt registrieren
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => router.push('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} />
                Zurück zur Startseite
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
