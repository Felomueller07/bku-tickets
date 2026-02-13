# ⚠️ GABRIEL - WICHTIG! DATABASE SETUP

## 🎯 DIE DATENBANK LÄUFT BEREITS!

**WICHTIG:** Die Datenbank ist eine **Cloud-Datenbank (Supabase)** und läuft **IMMER**!

Du musst sie **NICHT starten** - sie ist schon online! ✅

---

## 📍 WO IST DIE DATENBANK?

**Supabase Dashboard:** https://supabase.com/dashboard

**Login:**
- Mit dem Account, mit dem die Datenbank erstellt wurde
- Projekt: "bku-tickets"
- Region: Frankfurt

**Die Datenbank läuft 24/7 automatisch!** 🌐

---

## 🔧 WAS DU MACHEN MUSST

### Schritt 1: Vercel Environment Variables setzen

**Gehe zu:** https://vercel.com → Dein Projekt → Settings → Environment Variables

**Füge ALLE diese Variables hinzu:**
```bash
# DATENBANK (Supabase - läuft schon!)
DATABASE_URL=postgresql://postgres:[PASSWORT]@db.wuagypsicpsxhlqrajaf.supabase.co:5432/postgres

# NEXTAUTH
AUTH_SECRET=[generiere mit: openssl rand -base64 32]
AUTH_URL=https://bku-tickets.untgab.com
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://bku-tickets.untgab.com

# STRIPE (Hole die Keys aus der .env Datei!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# APP URL
NEXT_PUBLIC_APP_URL=https://bku-tickets.untgab.com
```

**Die echten Keys findest du in der `.env` Datei im Projektordner!**

**WICHTIG:** 
- Klicke bei JEDER Variable auf **"Add"** oder **"Save"**
- Setze sie für **"Production"** Environment

---

### Schritt 2: Redeploy

1. Gehe zu **Deployments**
2. Klicke auf das neueste Deployment
3. Klicke auf die **3 Punkte** → **"Redeploy"**
4. Warte bis Deployment fertig ist (~2 Minuten)

---

### Schritt 3: Testen

Gehe zu: **https://bku-tickets.untgab.com/auth/login**

**Login mit:**
- Email: `admin@bku.com`
- Passwort: `admin123`

✅ **FERTIG!** Die Datenbank ist verbunden!

---

## 💡 VERSTEHEN: Wie funktioniert das?
```
┌─────────────────┐
│  Vercel App     │  ← Deine Website (braucht DATABASE_URL!)
│  (Production)   │
└────────┬────────┘
         │
         │ DATABASE_URL sagt: "Verbinde zu..."
         │
         ↓
┌─────────────────┐
│  Supabase       │  ← Datenbank (läuft IMMER in der Cloud!)
│  PostgreSQL     │
│  (Frankfurt)    │
└─────────────────┘
```

**Die Datenbank läuft schon!** ✅  
**Vercel muss nur wissen WO sie ist!** → DATABASE_URL

---

## ❌ HÄUFIGE FEHLER

**"Kann mich nicht anmelden"**
→ Hast du DATABASE_URL in Vercel gesetzt?
→ Hast du Redeploy gemacht?

**"Migration failed"**
→ Die Migration ist schon gelaufen! Ignorieren!

**"Wie starte ich die Datenbank?"**
→ MUSST DU NICHT! Supabase läuft 24/7 automatisch!

---

## 🆘 PROBLEME?

**Schritt 1:** Prüfe in Vercel → Settings → Environment Variables
- Ist `DATABASE_URL` gesetzt?
- Sind ALLE Variables gesetzt?

**Schritt 2:** Redeploy nochmal

**Schritt 3:** Schreib Felix

---

## 📊 DATENBANK ÜBERWACHEN

**Supabase Dashboard:** https://supabase.com/dashboard

Dort siehst du:
- ✅ Ist die Datenbank online? (Ja, immer!)
- 📊 Wie viele Daten sind gespeichert?
- 👥 Welche User sind registriert?

**Die Datenbank braucht KEINE Wartung!** Supabase macht alles automatisch! 🎉

---

## ✅ CHECKLISTE

- [ ] Alle Environment Variables in Vercel gesetzt
- [ ] Redeploy durchgeführt
- [ ] Login auf bku-tickets.untgab.com funktioniert
- [ ] Admin Panel erreichbar

**FERTIG!** 🚀
