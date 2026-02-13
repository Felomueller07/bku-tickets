'use client';

import Link from 'next/link';
import { Scale, Shield, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderTop: '1px solid rgba(212, 175, 55, 0.3)',
      padding: '2rem 1rem',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          
          {/* INFO */}
          <div>
            <h3 style={{ color: '#d4af37', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
              Josefi Konzert 2026
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
              Bürgerkapelle Untermais<br />
              22. März 2026<br />
              Kursaal Meran
            </p>
          </div>

          {/* RECHTLICHES */}
          <div>
            <h4 style={{ color: '#d4af37', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
              Rechtliches
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/impressum" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scale style={{ width: '16px', height: '16px' }} />
                Impressum
              </Link>
              <Link href="/datenschutz" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield style={{ width: '16px', height: '16px' }} />
                Datenschutzerklärung
              </Link>
              <Link href="/agb" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText style={{ width: '16px', height: '16px' }} />
                AGB
              </Link>
            </div>
          </div>

          {/* KONTAKT */}
          <div>
            <h4 style={{ color: '#d4af37', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
              Kontakt
            </h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', margin: 0 }}>
              info@bku-untermais.it
            </p>
          </div>
        </div>

        {/* LINIE */}
        <div style={{ height: '1px', backgroundColor: 'rgba(212, 175, 55, 0.2)', marginBottom: '1.5rem' }} />

        {/* COPYRIGHT */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>
            © {new Date().getFullYear()} Bürgerkapelle Untermais. Alle Rechte vorbehalten.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.625rem', margin: 0 }}>
            Zahlungsabwicklung über Stripe · Sichere Verschlüsselung
          </p>
        </div>
      </div>
    </footer>
  );
}
