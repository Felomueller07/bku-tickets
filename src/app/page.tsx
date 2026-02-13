'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, Ticket, ArrowRight, Sparkles, Music, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

const Clothespin = () => (
  <div style={{
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '45px',
    height: '28px',
    zIndex: 10,
  }}>
    <div style={{
      position: 'absolute',
      left: '3px',
      top: '0',
      width: '15px',
      height: '25px',
      background: 'linear-gradient(135deg, #A0826D 0%, #8B7355 50%, #6B5844 100%)',
      borderRadius: '4px 4px 3px 3px',
      boxShadow: '0 3px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)',
    }} />
    <div style={{
      position: 'absolute',
      right: '3px',
      top: '0',
      width: '15px',
      height: '25px',
      background: 'linear-gradient(135deg, #A0826D 0%, #8B7355 50%, #6B5844 100%)',
      borderRadius: '4px 4px 3px 3px',
      boxShadow: '0 3px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)',
    }} />
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '6px',
      transform: 'translateX(-50%)',
      width: '20px',
      height: '11px',
      border: '2.5px solid #666',
      borderRadius: '50%',
      background: 'linear-gradient(180deg, #888 0%, #666 50%, #444 100%)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
    }} />
  </div>
);

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} style={{ 
      background: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Beleuchtungseffekte */}
      <div style={{
        position: 'fixed',
        top: '-25%',
        right: '-15%',
        width: '1000px',
        height: '1000px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.15) 30%, transparent 70%)',
        filter: 'blur(120px)',
        zIndex: 0,
      }} />

      <div style={{
        position: 'fixed',
        top: '5%',
        right: '10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, transparent 70%)',
        filter: 'blur(90px)',
        zIndex: 0,
      }} />
      
      <div style={{
        position: 'fixed',
        bottom: '-25%',
        left: '-15%',
        width: '900px',
        height: '900px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
        filter: 'blur(110px)',
        zIndex: 0,
      }} />

      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0,
      }} />

      <div style={{
        position: 'fixed',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
        filter: 'blur(100px)',
        zIndex: 0,
      }} />

      {/* WÄSCHELEINE LINKS - nur auf Desktop */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          left: '15rem',
          top: '15vh',
          width: '5px',
          height: '70vh',
          background: 'linear-gradient(180deg, rgba(120, 120, 120, 0.6) 0%, rgba(100, 100, 100, 0.8) 50%, rgba(120, 120, 120, 0.6) 100%)',
          boxShadow: '3px 0 8px rgba(0, 0, 0, 0.5), inset -1px 0 2px rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
          zIndex: 2,
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            background: 'radial-gradient(circle, rgba(140, 140, 140, 0.9) 0%, rgba(100, 100, 100, 0.8) 100%)',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            background: 'radial-gradient(circle, rgba(140, 140, 140, 0.9) 0%, rgba(100, 100, 100, 0.8) 100%)',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          }} />

          <motion.div
            initial={{ opacity: 0, y: -20, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            style={{
              position: 'absolute',
              top: '5%',
              left: '-6.75rem',
              width: '220px',
              height: '147px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Clothespin />
            <Image
              src="/collage1.JPG"
              alt="BKU Konzert"
              fill
              style={{ objectFit: 'cover' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            style={{
              position: 'absolute',
              top: '41%',
              left: '-6.75rem',
              width: '220px',
              height: '147px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Clothespin />
            <Image
              src="/collage2.JPG"
              alt="BKU Konzert"
              fill
              style={{ objectFit: 'cover' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            style={{
              position: 'absolute',
              top: '77%',
              left: '-6.75rem',
              width: '220px',
              height: '147px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Clothespin />
            <Image
              src="/collage3.JPG"
              alt="BKU Konzert"
              fill
              style={{ objectFit: 'cover' }}
            />
          </motion.div>
        </div>
      )}

      {/* WÄSCHELEINE RECHTS - nur auf Desktop */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          right: '15rem',
          top: '15vh',
          width: '5px',
          height: '70vh',
          background: 'linear-gradient(180deg, rgba(120, 120, 120, 0.6) 0%, rgba(100, 100, 100, 0.8) 50%, rgba(120, 120, 120, 0.6) 100%)',
          boxShadow: '3px 0 8px rgba(0, 0, 0, 0.5), inset -1px 0 2px rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
          zIndex: 2,
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            background: 'radial-gradient(circle, rgba(140, 140, 140, 0.9) 0%, rgba(100, 100, 100, 0.8) 100%)',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            background: 'radial-gradient(circle, rgba(140, 140, 140, 0.9) 0%, rgba(100, 100, 100, 0.8) 100%)',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          }} />

          <motion.div
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            style={{
              position: 'absolute',
              top: '5%',
              right: '-6.75rem',
              width: '220px',
              height: '147px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Clothespin />
            <Image
              src="/collage4.JPG"
              alt="BKU Konzert"
              fill
              style={{ objectFit: 'cover' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            style={{
              position: 'absolute',
              top: '41%',
              right: '-6.75rem',
              width: '220px',
              height: '147px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Clothespin />
            <Image
              src="/collage5.JPG"
              alt="BKU Konzert"
              fill
              style={{ objectFit: 'cover' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            style={{
              position: 'absolute',
              top: '77%',
              right: '-6.75rem',
              width: '220px',
              height: '147px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Clothespin />
            <Image
              src="/collage6.JPG"
              alt="BKU Konzert"
              fill
              style={{ objectFit: 'cover' }}
            />
          </motion.div>
        </div>
      )}

      {/* NAVBAR - ⭐ NUR NOCH "Zum Sitzplan" Button */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.1)',
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>
            <div style={{ 
              position: 'relative', 
              width: isMobile ? '40px' : '50px', 
              height: isMobile ? '40px' : '50px',
              cursor: 'pointer',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
            onClick={() => router.push('/')}>
              <Image
                src="/bku-logo.png"
                alt="BKU Logo"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <span style={{
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: isMobile ? '1rem' : '1.25rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              TICKETS
            </span>
          </div>

          {/* ⭐ NUR NOCH EIN BUTTON - Zum Sitzplan */}
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: isMobile ? '0.5rem 1rem' : '0.625rem 1.25rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            Zum Sitzplan
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section style={{ y: isMobile ? 0 : y, opacity: isMobile ? 1 : opacity, position: 'relative', zIndex: 1 }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '1rem' : '2rem',
          paddingTop: isMobile ? '5rem' : '6rem',
        }}>
          <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'relative',
                width: isMobile ? '100px' : '150px',
                height: isMobile ? '100px' : '150px',
                margin: isMobile ? '0 auto 1.5rem' : '0 auto 2rem',
                borderRadius: '24px',
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: isMobile ? '0.5rem' : '0.75rem',
                padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '100px',
                marginBottom: isMobile ? '1.5rem' : '2rem',
              }}
            >
              <Sparkles style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px', color: '#f59e0b' }} />
              <span style={{ fontSize: isMobile ? '1rem' : '1.5rem', color: '#f59e0b', fontWeight: '700' }}>
                22. März 2026
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: isMobile ? 'clamp(2rem, 10vw, 3.5rem)' : 'clamp(3rem, 8vw, 6rem)',
                fontWeight: '900',
                lineHeight: '1.1',
                marginBottom: isMobile ? '1rem' : '1.5rem',
                background: 'linear-gradient(135deg, #fff 0%, #f59e0b 50%, #ea580c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              JOSEFI<br />KONZERT
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                fontSize: isMobile ? '0.875rem' : 'clamp(1.125rem, 2vw, 1.5rem)',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: isMobile ? '2rem' : '3rem',
                maxWidth: '600px',
                margin: isMobile ? '0 auto 2rem' : '0 auto 3rem',
                padding: isMobile ? '0 1rem' : '0',
              }}
            >
              Erleben Sie einen unvergesslichen Abend mit der{isMobile ? ' ' : <br />}
              Bürgerkapelle Untermais im Kursaal Meran
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{
                display: 'flex',
                gap: isMobile ? '0.75rem' : '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                padding: isMobile ? '0 1rem' : '0',
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: isMobile ? '1rem 1.5rem' : '1.25rem 2.5rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: isMobile ? '0.875rem' : '1.125rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
                }}
              >
                <Ticket size={isMobile ? 18 : 24} />
                Tickets kaufen
                <ArrowRight size={isMobile ? 16 : 20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  padding: isMobile ? '1rem 1.5rem' : '1.25rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: isMobile ? '0.875rem' : '1.125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Mehr erfahren
              </motion.button>
            </motion.div>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              style={{
                marginTop: isMobile ? '3rem' : '5rem',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: isMobile ? '1rem' : '1.5rem',
                maxWidth: '900px',
                margin: isMobile ? '3rem auto 0' : '5rem auto 0',
                padding: isMobile ? '0 1rem' : '0',
              }}
            >
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}>
                <Calendar style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', color: '#f59e0b', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Datum</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                  22. März 2026<br />19:00 Uhr
                </p>
              </div>

              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}>
                <MapPin style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', color: '#f59e0b', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Ort</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                  Kursaal Meran<br />Südtirol
                </p>
              </div>

              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}>
                <Music style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', color: '#f59e0b', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Preis</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                  20,00 €<br />pro Ticket
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Info Section */}
      <section id="info" style={{ position: 'relative', zIndex: 1, padding: isMobile ? '4rem 1rem' : '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '4rem' }}>
          <h2 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: isMobile ? 'clamp(1.75rem, 6vw, 2.5rem)' : 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ein Abend voller Musik
          </h2>
          <p style={{ fontSize: isMobile ? '0.875rem' : '1.125rem', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '600px', margin: '0 auto' }}>
            Die Bürgerkapelle Untermais lädt zum traditionellen Josefi Konzert ein
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: isMobile ? '1.5rem' : '2rem' }}>
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }} 
            viewport={{ once: true }} 
            style={{ 
              padding: isMobile ? '2rem' : '3rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(245, 158, 11, 0.2)', 
              borderRadius: '24px' 
            }}
          >
            <Users style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', color: '#f59e0b', marginBottom: '1.5rem' }} />
            <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Über die BKU</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.7', fontSize: isMobile ? '0.875rem' : '1rem', marginBottom: '1rem' }}>
              Die Bürgerkapelle Untermais wurde im Jahr 1883 gegründet, seitdem ist sie fester Bestandteil des Untermaiser Dorflebens. Die Mitgliederanzahl von rund 68 Musikant*innen setzt sich beinahe zur Hälfte aus Frauen und Männern zusammen, welche aktiv zur musikalischen Gestaltung unter der Leitung von Kapellmeister Markus Müller und Obmann Florian Rainer beitragen.
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.7', fontSize: isMobile ? '0.875rem' : '1rem', marginBottom: '1rem' }}>
              Zu den Hauptaufgaben der Bürgerkapelle zählen die musikalische Umrahmung von kirchlichen Feiern (hl. Messen, Erstkommunion, Firmung, Prozessionen) und weltlichen Anlässen (Platzkonzerten, Ständchen, Wertungsspiele, Ausflüge mit musikalischer Tätigkeit).
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.7', fontSize: isMobile ? '0.875rem' : '1rem', marginBottom: '1rem' }}>
              Die Bandbreite der Bürgerkapelle Untermais reicht von kirchlichen Werken über traditioneller Blas- und Marschmusik, klassischen Orchesterstücken, bis hin zu modernen, anspruchsvollen Stücken zeitgenössischer Komponisten und Interpretationen.
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.7', fontSize: isMobile ? '0.875rem' : '1rem', marginBottom: '1.5rem' }}>
              Das gemeinsame Musizieren und die Liebe zur Musik verbindet die Mitglieder der Bürgerkapelle genauso wie das Einstehen für soziale Werte, das Leben in der Gemeinschaft, das Fördern und Integrieren der Jugend und das Wahren von Traditionen.
            </p>
            
            <motion.a
              href="https://www.bku.it"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: isMobile ? '0.875rem' : '1rem',
                fontWeight: '600',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.3s',
              }}
            >
              Mehr über die BKU erfahren
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </motion.a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }} 
            viewport={{ once: true }} 
            style={{ 
              padding: isMobile ? '2rem' : '3rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(59, 130, 246, 0.2)', 
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div>
              <Music style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', color: '#3b82f6', marginBottom: '1.5rem' }} />
              <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Das Programm</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.7', fontSize: isMobile ? '0.875rem' : '1rem', marginBottom: '1.5rem' }}>
                Freuen Sie sich auf ein abwechslungsreiches Programm mit klassischen und modernen Stücken.
              </p>
            </div>

            {/* Programm-Flyer als Bild */}
            <div style={{
              position: 'relative',
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}>
              <Image
                src="/programm-flyer.png"
                alt="Konzert Programm"
                width={1240}
                height={1754}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ position: 'relative', zIndex: 1, padding: isMobile ? '4rem 1rem' : '8rem 2rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '2.5rem 1.5rem' : '4rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: isMobile ? 'clamp(1.5rem, 6vw, 2rem)' : 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
            Sichern Sie sich jetzt{isMobile ? ' ' : <br />}Ihre Tickets!
          </h2>
          <p style={{ fontSize: isMobile ? '0.875rem' : '1.125rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: isMobile ? '1.5rem' : '2rem' }}>
            Begrenzte Plätze verfügbar. Verpassen Sie nicht dieses besondere Konzert.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => router.push('/dashboard')}
            style={{ 
              padding: isMobile ? '1rem 2rem' : '1.25rem 3rem', 
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
              border: 'none', 
              borderRadius: '12px', 
              color: '#fff', 
              fontSize: isMobile ? '0.875rem' : '1.125rem', 
              fontWeight: '700', 
              cursor: 'pointer', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)' 
            }}
          >
            <Ticket size={isMobile ? 20 : 24} />
            Jetzt Tickets kaufen
            <ArrowRight size={isMobile ? 16 : 20} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, padding: isMobile ? '3rem 1rem' : '4rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ position: 'relative', width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px', borderRadius: '12px', overflow: 'hidden' }}>
                <Image src="/bku-logo.png" alt="BKU Logo" fill style={{ objectFit: 'cover' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: '700', background: 'linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                TICKETS
              </span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>Bürgerkapelle Untermais</p>
          </div>

          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
            <p>© 2026 BKU Tickets. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}