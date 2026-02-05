'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Login fehlgeschlagen');
        setLoading(false);
      } else {
        toast.success('Erfolgreich angemeldet!');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        backgroundColor: 'rgba(20, 20, 20, 0.98)',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid rgba(212, 175, 55, 0.3)',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <Image
              src="/bku-logo.png"
              alt="BKU Logo"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        <h1 style={{
          color: '#d4af37',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}>
          Admin Login
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.875rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          BKU Tickets Verwaltung
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading
                ? 'rgba(212, 175, 55, 0.5)'
                : 'linear-gradient(135deg, #d4af37 0%, #c19e2e 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Lädt...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}