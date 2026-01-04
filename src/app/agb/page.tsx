'use client';

import { motion } from 'framer-motion';
import { FileText, ArrowLeft, ShoppingCart, CreditCard, RotateCcw, AlertTriangle, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AGBPage() {
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
            <FileText style={{ width: '40px', height: '40px', color: '#d4af37' }} />
            <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: '700', margin: 0 }}>
              AGB
            </h1>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.125rem', margin: '0 0 1rem 0' }}>
            Allgemeine Geschäftsbedingungen für den Ticketverkauf
          </p>
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
          
          {/* § 1 GELTUNGSBEREICH */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              § 1 Geltungsbereich
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über den Verkauf von 
                Eintrittskarten für das Josefi Konzert 2026 am 22. März 2026 im Kursaal Meran, die über diese 
                Website zwischen der Bürgerkapelle Untermais (nachfolgend "Veranstalter") und dem Käufer 
                (nachfolgend "Kunde") geschlossen werden.
              </p>
              <p style={{ margin: 0 }}>
                Mit dem Absenden der Bestellung erkennt der Kunde diese AGB an.
              </p>
            </div>
          </section>

          {/* § 2 VERTRAGSPARTNER */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              § 2 Vertragspartner und Veranstalter
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '1rem', color: 'white' }}>
                Bürgerkapelle Untermais (BKU)
              </p>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)' }}>
                [Adresse wird ergänzt]<br />
                [E-Mail wird ergänzt]<br />
                Italien
              </p>
            </div>
          </section>

          {/* § 3 VERTRAGSSCHLUSS */}
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
              <ShoppingCart style={{ width: '24px', height: '24px' }} />
              § 3 Vertragsschluss
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(1)</strong> Die Darstellung der Tickets auf dieser Website stellt kein rechtlich 
                bindendes Angebot dar, sondern eine unverbindliche Aufforderung zur Bestellung.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(2)</strong> Durch Anklicken des Buttons "Zur Kassa" geben Sie eine verbindliche 
                Bestellung der ausgewählten Tickets ab.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(3)</strong> Der Vertragsschluss erfolgt nach erfolgreichem Abschluss der Zahlung 
                über Stripe. Sie erhalten eine Bestellbestätigung per E-Mail.
              </p>
              <p style={{ margin: 0 }}>
                <strong>(4)</strong> Die ausgewählten Sitzplätze werden während des Bestellvorgangs für 
                10 Minuten für Sie reserviert.
              </p>
            </div>
          </section>

          {/* § 4 PREISE UND ZAHLUNG */}
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
              § 4 Preise und Zahlung
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(1)</strong> Alle angegebenen Preise sind Endpreise in Euro (€) inklusive der 
                gesetzlichen Mehrwertsteuer.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(2)</strong> Der Ticketpreis beträgt 20,00 € pro Ticket.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(3)</strong> Die Zahlung erfolgt über unseren Zahlungsdienstleister Stripe. 
                Folgende Zahlungsmethoden werden akzeptiert:
              </p>
              <ul style={{ paddingLeft: '1.5rem', margin: '0 0 1rem 0' }}>
                <li>Kreditkarte (Visa, Mastercard, American Express)</li>
                <li>Debitkarte</li>
                <li>Weitere von Stripe unterstützte Zahlungsmethoden</li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>(4)</strong> Der Kaufpreis wird mit Vertragsschluss fällig.
              </p>
            </div>
          </section>

          {/* § 5 TICKETAUSLIEFERUNG */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              § 5 Ticketauslieferung
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(1)</strong> Die Tickets werden nach erfolgreichem Zahlungsabschluss per E-Mail 
                an die angegebene E-Mail-Adresse versandt.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(2)</strong> Der Kunde ist verpflichtet, das Ticket (digital oder ausgedruckt) 
                beim Einlass zur Veranstaltung vorzuzeigen.
              </p>
              <p style={{ margin: 0 }}>
                <strong>(3)</strong> Der Veranstalter haftet nicht für die Nichterhaltung der E-Mail 
                aufgrund falscher E-Mail-Adresse oder voller Mailbox.
              </p>
            </div>
          </section>

          {/* § 6 WIDERRUFSRECHT */}
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
              <RotateCcw style={{ width: '24px', height: '24px' }} />
              § 6 Widerrufsrecht und Stornierung
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(1)</strong> Für Tickets zu Veranstaltungen mit festem Termin besteht gemäß 
                europäischem Verbraucherrecht kein Widerrufsrecht.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(2)</strong> Eine Stornierung oder Rückgabe von bereits gekauften Tickets ist 
                grundsätzlich ausgeschlossen.
              </p>
              <p style={{ margin: 0 }}>
                <strong>(3)</strong> Im Falle einer Absage oder Verlegung der Veranstaltung durch den 
                Veranstalter wird der Ticketpreis vollständig zurückerstattet.
              </p>
            </div>
          </section>

          {/* § 7 VERANSTALTUNGSBESUCH */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              § 7 Veranstaltungsbesuch
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(1)</strong> Das Ticket berechtigt zum einmaligen Besuch der Veranstaltung am 
                angegebenen Datum und auf dem angegebenen Sitzplatz.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(2)</strong> Das Ticket ist nicht übertragbar und nur in Verbindung mit einem 
                gültigen Ausweis gültig.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(3)</strong> Der Veranstalter behält sich das Recht vor, Personen vom 
                Veranstaltungsbesuch auszuschließen, wenn berechtigte Gründe vorliegen.
              </p>
              <p style={{ margin: 0 }}>
                <strong>(4)</strong> Bei verspätetem Erscheinen besteht kein Anspruch auf Einlass oder 
                Rückerstattung des Ticketpreises.
              </p>
            </div>
          </section>

          {/* § 8 HAFTUNG */}
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
              <AlertTriangle style={{ width: '24px', height: '24px' }} />
              § 8 Haftung
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(1)</strong> Der Veranstalter haftet nicht für Schäden, die durch höhere Gewalt, 
                behördliche Anordnungen oder andere unvorhersehbare Umstände entstehen.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(2)</strong> Der Veranstalter haftet nicht für den Verlust oder Diebstahl von 
                Gegenständen während der Veranstaltung.
              </p>
              <p style={{ margin: 0 }}>
                <strong>(3)</strong> Die Haftung für Personenschäden bleibt unberührt.
              </p>
            </div>
          </section>

          {/* § 9 FREIKARTEN */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              § 9 Freikarten
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(1)</strong> Freikarten können über spezielle Freikarten-Codes eingelöst werden.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(2)</strong> Jeder Freikarten-Code kann nur einmal verwendet werden.
              </p>
              <p style={{ margin: 0 }}>
                <strong>(3)</strong> Freikarten sind nicht übertragbar und nicht gegen Bargeld einlösbar.
              </p>
            </div>
          </section>

          {/* § 10 DATENSCHUTZ */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              § 10 Datenschutz
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: 0 }}>
                Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer{' '}
                
                  href="/datenschutz"
                  style={{ color: '#d4af37', textDecoration: 'underline' }}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/datenschutz');
                  }}
                >
                  Datenschutzerklärung
                </a>.
              </p>
            </div>
          </section>

          {/* § 11 ANWENDBARES RECHT */}
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
              <Scale style={{ width: '24px', height: '24px' }} />
              § 11 Anwendbares Recht und Gerichtsstand
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(1)</strong> Es gilt ausschließlich italienisches Recht unter Ausschluss des 
                UN-Kaufrechts.
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>(2)</strong> Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist Bozen 
                (Bolzano), Italien.
              </p>
              <p style={{ margin: 0 }}>
                <strong>(3)</strong> Die Rechte der Verbraucher, ihr lokales Gericht anzurufen, bleiben 
                hiervon unberührt.
              </p>
            </div>
          </section>

          {/* § 12 SALVATORISCHE KLAUSEL */}
          <section>
            <h2 style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              § 12 Salvatorische Klausel
            </h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: 0 }}>
                Sollte eine Bestimmung dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der 
                übrigen Bestimmungen hiervon unberührt. Die unwirksame Bestimmung wird durch eine wirksame 
                ersetzt, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
              </p>
            </div>
          </section>

        </motion.div>

        {/* STAND */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginTop: '2rem', textAlign: 'center' }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', margin: 0 }}>
            Stand: Januar 2026
          </p>
        </motion.div>

        {/* AKZEPTANZ HINWEIS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '1rem',
          }}
        >
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.875rem',
            margin: 0,
            textAlign: 'center',
          }}>
            <strong>Hinweis:</strong> Mit dem Kauf eines Tickets akzeptieren Sie automatisch diese AGB.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
