'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registrierung fehlgeschlagen');
        setLoading(false);
        return;
      }

      // Erfolg! Weiterleitung zum Login
      router.push('/login?registered=true');
    } catch (err) {
      setError('Ein Fehler ist aufgetreten');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h1 style={{
            color: '#d4af37',
            fontSize: '2rem',
            fontWeight: '700',
            margin: 0,
            marginBottom: '0.5rem',
            letterSpacing: '-0.025em',
          }}>
            Konto erstellen
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9375rem',
            margin: 0,
          }}>
            Josefi Konzert 2026 - Tickets
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle style={{ width: '20px', height: '20px', color: '#ef4444', flexShrink: 0 }} />
            <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</span>
          </motion.div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
            }}>
              Name
            </label>
            <div style={{ position: 'relative' }}>
              <User style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: 'rgba(255, 255, 255, 0.4)',
              }} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Max Mustermann"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          </div>

          {/* EMAIL */}
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
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: 'rgba(255, 255, 255, 0.4)',
              }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="max@beispiel.de"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: '2rem' }}>
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
              <Lock style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: 'rgba(255, 255, 255, 0.4)',
              }} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mindestens 6 Zeichen"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.8125rem',
              marginTop: '0.5rem',
              margin: 0,
              marginTop: '0.5rem',
            }}>
              Mindestens 6 Zeichen
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading
                ? 'rgba(212, 175, 55, 0.5)'
                : 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
              color: '#000',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(212, 175, 55, 0.3)',
              marginBottom: '1.5rem',
            }}
          >
            {loading ? 'Registrierung läuft...' : (
              <>
                Konto erstellen
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </>
            )}
          </motion.button>

          {/* LOGIN LINK */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              Bereits ein Konto?{' '}
            </span>
            <Link
              href="/login"
              style={{
                color: '#d4af37',
                fontSize: '0.875rem',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              Jetzt anmelden
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}