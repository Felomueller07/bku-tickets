'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setShowBanner(false);
  };

  const handleNecessaryOnly = () => {
    handleRejectAll();
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: '1rem',
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Cookie style={{ width: '24px', height: '24px', color: '#d4af37' }} />
              <h3 style={{
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: '700',
                margin: 0,
              }}>
                Cookie-Einstellungen
              </h3>
            </div>
            
            <button
              onClick={handleNecessaryOnly}
              title="Nur notwendige Cookies (Banner schließen)"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            marginBottom: '1rem',
          }}>
            Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
            Technisch notwendige Cookies werden für den Betrieb der Website benötigt. 
            Analysecookies helfen uns, die Website zu verbessern. 
            Sie können Ihre Einwilligung jederzeit widerrufen.
          </p>

          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <strong style={{ color: 'white', fontSize: '0.875rem' }}>
                      Notwendige Cookies
                    </strong>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                      margin: '0.25rem 0 0 0',
                    }}>
                      Erforderlich für Login, Warenkorb und Zahlung
                    </p>
                  </div>
                  <span style={{
                    color: '#4ade80',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}>
                    Immer aktiv
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <strong style={{ color: 'white', fontSize: '0.875rem' }}>
                      Zahlungs-Cookies (Stripe)
                    </strong>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                      margin: '0.25rem 0 0 0',
                    }}>
                      Sichere Zahlungsabwicklung über Stripe
                    </p>
                  </div>
                  <span style={{
                    color: '#4ade80',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}>
                    Immer aktiv
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
          }}>
            <button
              onClick={handleRejectAll}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Alle ablehnen
            </button>

            <button
              onClick={handleAcceptAll}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#000',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Alle akzeptieren
            </button>

            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '0.5rem',
                color: '#d4af37',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <Shield style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.25rem' }} />
              {showDetails ? 'Details verbergen' : 'Details anzeigen'}
            </button>

            <Link
              href="/datenschutz"
              style={{
                color: '#d4af37',
                fontSize: '0.75rem',
                textDecoration: 'underline',
                marginLeft: 'auto',
              }}
            >
              Datenschutzerklärung
            </Link>
          </div>

          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.625rem',
            marginTop: '0.75rem',
            marginBottom: 0,
          }}>
            Durch Schließen (X) werden nur notwendige Cookies verwendet.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
