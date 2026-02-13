# 🚀 Production Setup für Gabriel

## SCHRITT 1: Vercel Deployment

1. Push Code zu GitHub (ist schon gemacht ✅)
2. Gehe zu: https://vercel.com/new
3. Import Repository: **bku-tickets**
4. Framework: **Next.js**
5. **Deploy** klicken

---

## SCHRITT 2: Supabase PostgreSQL

Datenbank ist bereits erstellt! ✅
- **Provider:** Supabase
- **Region:** Frankfurt
- **Version:** PostgreSQL 16

---

## SCHRITT 3: Environment Variables setzen

In Vercel → Settings → Environment Variables:
```
AUTH_SECRET=[generiere mit: openssl rand -base64 32]
AUTH_URL=https://bku-tickets.untgab.com
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://bku-tickets.untgab.com

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[deine Stripe Publishable Key]
STRIPE_SECRET_KEY=[deine Stripe Secret Key]
STRIPE_WEBHOOK_SECRET=[nach Webhook Setup]

NEXT_PUBLIC_APP_URL=https://bku-tickets.untgab.com

DATABASE_URL=[Connection String aus Supabase]
```

---

## SCHRITT 4: Database Migration

In Vercel Console oder lokal mit Vercel CLI:
```bash
npx prisma migrate deploy
```

---

## SCHRITT 5: Admin User erstellen
```bash
npm run create-admin
```

Login: **admin@bku.com** / **admin123**

---

## SCHRITT 6: Stripe Webhook

1. https://dashboard.stripe.com/webhooks
2. **Add endpoint:** https://bku-tickets.untgab.com/api/webhook
3. **Events:** checkout.session.completed
4. Kopiere **Signing secret**
5. In Vercel → Environment Variables → STRIPE_WEBHOOK_SECRET updaten
6. Redeploy

---

## ✅ FERTIG!

Teste: https://bku-tickets.untgab.com

---

## 🔧 Technologie-Stack

- **Next.js 16.1.1** (neueste)
- **PostgreSQL 16** (Supabase)
- **Prisma 6** (ORM)
- **NextAuth v5** (Auth)
- **Stripe** (Payments)
- **Framer Motion** (Animations)

---

## 📊 Database Info

- **Provider:** Supabase
- **Type:** PostgreSQL 16
- **Storage:** 500 MB free
- **Backups:** Automatisch täglich
- **Uptime:** 99.9% SLA
