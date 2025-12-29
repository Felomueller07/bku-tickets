'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AuthButtons from '@/components/AuthButtons';
import UserMenu from '@/components/UserMenu';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Hintergrundbild */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/kapelle.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(1px)',
          opacity: 0.5,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* AUTH BUTTONS / USER MENU - OBEN RECHTS */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          zIndex: 50,
        }}
      >
        {status === 'loading' ? (
          <div style={{ color: 'white' }}>Lädt...</div>
        ) : session ? (
          <UserMenu />
        ) : (
          <AuthButtons />
        )}
      </motion.div>

      {/* CONTENT - ALLES ZUSAMMEN */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
        {/* TICKETVERKAUF */}
        <motion.h1
          className="text-[8rem] md:text-[12rem] lg:text-[15rem] leading-none text-center whitespace-nowrap"
          style={{
            fontFamily: "'Pacifico', cursive",
            color: '#b8b8b8',
            fontWeight: 400,
            paddingRight: '4rem',
            overflow: 'visible',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Ticketverkauf
        </motion.h1>

        {/* JOSEFI KONZERT 2026 */}
        <motion.div
          className="mt-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              fontWeight: 600,
              color: '#d4af37',
              textAlign: 'center',
              letterSpacing: '0.05em',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            Josefi Konzert 2026
          </p>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              marginTop: '0.5rem',
              letterSpacing: '0.1em',
            }}
          >
            22. März · Kursaal Meran
          </p>
        </motion.div>
      </div>

      {/* BUTTON - WEITER UNTEN */}
      <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <button 
            className="button2"
            onClick={() => router.push('/dashboard')}
          >
            Zu den Tickets
          </button>
        </motion.div>
      </div>
    </div>
  );
}