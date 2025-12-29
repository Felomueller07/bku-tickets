'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Ticket, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Schließe Dropdown beim Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    toast.loading('Abmeldung läuft...', { id: 'signout' });
    
    await signOut({ redirect: false });
    
    toast.success('Erfolgreich abgemeldet', { id: 'signout' });
    router.push('/');
    router.refresh();
  };

  if (!session) return null;

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* User Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '0.75rem',
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User style={{ width: '18px', height: '18px', color: '#000' }} />
        </div>

        {/* Name */}
        <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session.user?.name || session.user?.email}
        </span>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown style={{ width: '16px', height: '16px' }} />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              minWidth: '220px',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '0.75rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            {/* User Info */}
            <div
              style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#fff', marginBottom: '0.25rem' }}>
                {session.user?.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                {session.user?.email}
              </p>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '0.5rem' }}>
              {/* Meine Tickets */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                <Ticket style={{ width: '18px', height: '18px' }} />
                <span>Meine Tickets</span>
              </button>

              {/* Abmelden */}
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'rgba(239, 68, 68, 0.8)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(239, 68, 68, 0.8)';
                }}
              >
                <LogOut style={{ width: '18px', height: '18px' }} />
                <span>Abmelden</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}