'use client';

import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Database, Lock, Mail, Cookie, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DatenschutzPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* ZURÜCK BUTTON */}
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#d4af37',
            fontSize: '0.875rem',
            cursor: 'pointer',
            marginBottom: '2rem',
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Zurück zur Startseite
        </button>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Shield style={{ width: '40px', height: '40px', color: '#d4af37' }} />
            <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: '700', margin: 0 }}>
              Datenschutzerklärung
            </h1>
          </div>
          <div style={{
            height: '4px',
            width: '100px',
            background: 'linear-gradient(90deg, #d4af37 0%, transparent 100%)',
            marginBottom: '2rem',
          }} />
        </motion.div>

        {/* CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          
          {/* EINLEITUNG */}
          <section style={{ marginBottom: '2.5rem' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', lineHeight: '1.8', margin: 0 }}>
              Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Diese Datenschutzerklärung informiert Sie darüber, 
              wie wir mit Ihren personenbezogenen Daten umgehen, wenn Sie unsere Website nutzen und Tickets kaufen.
            </p>
          </section>

          {/* VERANTWORTLICHE STELLE */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              color: '#d4af37',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Database style={{ width: '24px', height: '24px' }} />
              Verantwortliche Stelle
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                Bürgerkapelle Untermais (BKU)
              </p>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)' }}>
                [Adresse wird ergänzt]<br />
                E-Mail: [wird ergänzt]
              </p>
            </div>
          </section>

          {/* WELCHE DATEN */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Welche Daten wir erheben
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Bei der Ticketbestellung:
              </h3>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                <li>Vorname und Nachname</li>
                <li>E-Mail-Adresse</li>
                <li>Zahlungsinformationen (werden direkt von Stripe verarbeitet)</li>
                <li>Sitzplatznummer</li>
                <li>Bestelldatum und -uhrzeit</li>
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Beim Besuch der Website:
              </h3>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                <li>IP-Adresse</li>
                <li>Browser-Typ und Version</li>
                <li>Betriebssystem</li>
                <li>Besuchte Seiten und Besuchszeit</li>
                <li>Cookies (siehe unten)</li>
              </ul>
            </div>
          </section>

          {/* ZWECK DER DATENVERARBEITUNG */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Zweck der Datenverarbeitung
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>Vertragserfüllung:</strong> Ihre Daten werden benötigt, um den Ticketkauf abzuwickeln und 
                Ihnen die Eintrittskarte zuzustellen.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>Zahlungsabwicklung:</strong> Zahlungsdaten werden ausschließlich über unseren 
                Zahlungsdienstleister Stripe verarbeitet.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Kundenservice:</strong> Um bei Fragen oder Problemen mit Ihnen kommunizieren zu können.
              </p>
            </div>
          </section>

          {/* COOKIES */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              color: '#d4af37',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Cookie style={{ width: '24px', height: '24px' }} />
              Cookies
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'white' }}>Notwendige Cookies:</strong>
                <p style={{ margin: '0.25rem 0 0 0' }}>
                  Diese Cookies sind für den Betrieb der Website unbedingt erforderlich (z.B. Login, Warenkorb, Zahlungsabwicklung).
                </p>
              </div>

              <div>
                <strong style={{ color: 'white' }}>Ihre Kontrolle über Cookies:</strong>
                <p style={{ margin: '0.25rem 0 0 0' }}>
                  Sie können über das Cookie-Banner Ihre Einwilligung jederzeit widerrufen oder ändern. 
                  In Ihren Browser-Einstellungen können Sie Cookies auch manuell löschen.
                </p>
              </div>
            </div>
          </section>

          {/* STRIPE */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              color: '#d4af37',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <CreditCard style={{ width: '24px', height: '24px' }} />
              Zahlungsabwicklung (Stripe)
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                Für die Zahlungsabwicklung nutzen wir den Dienstleister Stripe (Stripe Payments Europe Ltd., 
                1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland).
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                Ihre Zahlungsdaten (Kreditkartennummer, etc.) werden direkt an Stripe übermittelt und dort 
                verschlüsselt verarbeitet. Wir haben zu keinem Zeitpunkt Zugriff auf Ihre vollständigen Zahlungsdaten.
              </p>
              <p style={{ margin: 0 }}>
                Datenschutzerklärung von Stripe: 
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#d4af37', marginLeft: '0.25rem' }}>
                  https://stripe.com/privacy
                </a>
              </p>
            </div>
          </section>

          {/* SPEICHERDAUER */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Speicherdauer
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: 0 }}>
                Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies für die Erfüllung des Vertrages 
                und zur Einhaltung gesetzlicher Aufbewahrungspflichten (z.B. steuerrechtlich) erforderlich ist. 
                Nach Ablauf dieser Fristen werden Ihre Daten gelöscht.
              </p>
            </div>
          </section>

          {/* IHRE RECHTE */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              color: '#d4af37',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Lock style={{ width: '24px', height: '24px' }} />
              Ihre Rechte
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                Sie haben nach der DSGVO folgende Rechte:
              </p>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                <li><strong>Auskunft:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
                <li><strong>Berichtigung:</strong> Sie können die Korrektur falscher Daten verlangen</li>
                <li><strong>Löschung:</strong> Sie können die Löschung Ihrer Daten verlangen</li>
                <li><strong>Einschränkung:</strong> Sie können die Einschränkung der Verarbeitung verlangen</li>
                <li><strong>Widerruf:</strong> Sie können Ihre Einwilligung jederzeit widerrufen</li>
                <li><strong>Beschwerde:</strong> Sie können sich bei einer Datenschutzbehörde beschweren</li>
              </ul>
            </div>
          </section>

          {/* KONTAKT */}
          <section>
            <h2 style={{
              color: '#d4af37',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Mail style={{ width: '24px', height: '24px' }} />
              Kontakt für Datenschutzfragen
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: 0 }}>
                Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte können Sie uns jederzeit kontaktieren:
              </p>
              <p style={{ margin: '1rem 0 0 0', fontWeight: '600', color: 'white' }}>
                E-Mail: [wird ergänzt]<br />
                Adresse: [wird ergänzt]
              </p>
            </div>
          </section>

        </motion.div>

        {/* STAND */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            marginTop: '2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', margin: 0 }}>
            Stand: Januar 2026
          </p>
        </motion.div>
      </div>
    </div>
  );
}
