import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gleiche Beleuchtung wie Landing Page */}
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
          bottom: '-25%',
          left: '-15%',
          width: '900px',
          height: '900px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
          filter: 'blur(110px)',
          zIndex: 0,
        }} />

        <div style={{ 
          color: 'white', 
          fontSize: '1.5rem',
          position: 'relative',
          zIndex: 1,
        }}>
          Lädt...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}