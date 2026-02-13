'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, User, Lock, CheckCircle, XCircle, ArrowLeft, UserPlus } from 'lucide-react';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#ef4444';
    if (passwordStrength < 70) return '#f59e0b';
    return '#10b981';
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Schwach';
    if (passwordStrength < 70) return 'Mittel';
    return 'Stark';
  };

  const requirements = [
    { text: 'Mindestens 8 Zeichen', met: formData.password.length >= 8 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (passwordStrength < 40) {
      setError('Passwort ist zu schwach');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registrierung fehlgeschlagen');
      }

      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message);
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
      padding: isMobile ? '1rem' : '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Starke Orange-Beleuchtung rechts oben */}
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

      {/* Zusätzliche Orange-Schicht */}
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
      
      {/* Starke Blau-Beleuchtung links unten */}
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

      {/* Zusätzliche Blau-Schicht */}
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
          maxWidth: '500px',
          width: '100%',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflowY: 'auto',
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
          Registrieren
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: isMobile ? '0.75rem' : '0.875rem',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          textAlign: 'center',
        }}>
          Erstelle deinen BKU Tickets Account
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
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Vorname */}
          <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}>
              Vorname
            </label>
            <div style={{ position: 'relative' }}>
              <User style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: formData.firstName ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
                transition: 'color 0.3s',
              }} />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: isMobile ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 1rem 0.75rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: isMobile ? '0.875rem' : '1rem',
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

          {/* Nachname */}
          <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}>
              Nachname
            </label>
            <div style={{ position: 'relative' }}>
              <User style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: formData.lastName ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
                transition: 'color 0.3s',
              }} />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: isMobile ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 1rem 0.75rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: isMobile ? '0.875rem' : '1rem',
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

          {/* Email */}
          <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: formData.email ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
                transition: 'color 0.3s',
              }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: isMobile ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 1rem 0.75rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: isMobile ? '0.875rem' : '1rem',
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

          {/* Passwort */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
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
                color: formData.password ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
                transition: 'color 0.3s',
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: isMobile ? '0.75rem 2.75rem 0.75rem 2.75rem' : '0.75rem 3rem 0.75rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: isMobile ? '0.875rem' : '1rem',
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
                  color: formData.password ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
                onMouseLeave={(e) => e.currentTarget.style.color = formData.password ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)'}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {formData.password && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: isMobile ? '0.625rem' : '0.75rem' }}>
                    Passwort-Stärke:
                  </span>
                  <span style={{ color: getStrengthColor(), fontSize: isMobile ? '0.625rem' : '0.75rem', fontWeight: '600' }}>
                    {getStrengthText()}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength}%` }}
                    transition={{ duration: 0.3 }}
                    style={{
                      height: '100%',
                      backgroundColor: getStrengthColor(),
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            )}

            {formData.password && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {requirements.map((req, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {req.met ? (
                      <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
                    ) : (
                      <XCircle style={{ width: '14px', height: '14px', color: 'rgba(255, 255, 255, 0.3)' }} />
                    )}
                    <span style={{
                      color: req.met ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
                      fontSize: isMobile ? '0.625rem' : '0.75rem',
                    }}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Passwort bestätigen */}
          <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}>
              Passwort bestätigen
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: formData.confirmPassword ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
                transition: 'color 0.3s',
              }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: isMobile ? '0.75rem 2.75rem 0.75rem 2.75rem' : '0.75rem 3rem 0.75rem 3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${formData.confirmPassword && formData.password !== formData.confirmPassword ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  outline: 'none',
                  transition: 'all 0.3s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4af37';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = formData.confirmPassword && formData.password !== formData.confirmPassword ? '#ef4444' : 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: formData.confirmPassword ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
                onMouseLeave={(e) => e.currentTarget.style.color = formData.confirmPassword ? '#4a4a4a' : 'rgba(255, 255, 255, 0.5)'}
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p style={{ color: '#ef4444', fontSize: isMobile ? '0.625rem' : '0.75rem', marginTop: '0.5rem' }}>
                Passwörter stimmen nicht überein
              </p>
            )}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.3s',
            }}
          >
            {loading ? (
              'Registrierung läuft...'
            ) : (
              <>
                <UserPlus size={isMobile ? 16 : 18} />
                Registrieren
              </>
            )}
          </motion.button>
        </form>

        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: isMobile ? '0.75rem' : '0.875rem',
          marginTop: '1.5rem',
          textAlign: 'center',
        }}>
          Bereits registriert?{' '}
          <button
            onClick={() => router.push('/auth/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af37',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '500',
            }}
          >
            Zum Login
          </button>
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/auth/login')}
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
          Zurück zum Login
        </motion.button>
      </motion.div>
    </div>
  );
}