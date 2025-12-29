# BKU Tickets - Josefi Konzert 2026

Ticket-Verkaufssystem für das Josefi Konzert 2026 im Kursaal Meran.

## Features

- ✅ Interaktive Sitzplatzauswahl
- ✅ Admin-Dashboard zur Verwaltung
- ✅ Stripe-Integration für Zahlungen
- ✅ Freikarten-System
- ✅ User-Authentifizierung (NextAuth)
- ✅ Datenbank mit Prisma (SQLite/PostgreSQL)

## Installation

### 1. Repository klonen
```bash
git clone <dein-repo-url>
cd bku-tickets
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Environment Variables

Erstelle eine `.env.local` Datei:
```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
AUTH_SECRET="dein-super-geheimer-key-hier-mindestens-32-zeichen-lang"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Datenbank initialisieren
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Admin-User erstellen
```bash
npm run create-admin
```

**Login:** admin@bku.com / admin123

### 6. Development Server starten
```bash
npm run dev
```

Server läuft auf: http://localhost:3000

---

## Deployment (Production)

### Vercel (Empfohlen)

1. **Vercel Account:** https://vercel.com
2. **Import Git Repository**
3. **Environment Variables hinzufügen** (alle aus `.env.local`)
4. **DATABASE_URL ändern** zu PostgreSQL (z.B. von Vercel Postgres)
5. **Deploy!**

### Nach dem Deployment:
```bash
# Datenbank migrieren
npx prisma migrate deploy

# Admin erstellen
npm run create-admin
```

---

## Stripe Webhook (Production)

1. Gehe zu: https://dashboard.stripe.com/webhooks
2. Klicke "Add endpoint"
3. URL: `https://deine-domain.com/api/webhook`
4. Events auswählen: `checkout.session.completed`
5. Webhook Secret kopieren → `STRIPE_WEBHOOK_SECRET`

---

## Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run create-admin # Admin-User erstellen
```

---

## Technologie-Stack

- **Framework:** Next.js 16
- **Styling:** Inline Styles + Framer Motion
- **Auth:** NextAuth v5
- **Database:** Prisma (SQLite/PostgreSQL)
- **Payments:** Stripe
- **Deployment:** Vercel

---

## Support

Bei Fragen: [deine-email@beispiel.de]
