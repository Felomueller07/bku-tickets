'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Check } from 'lucide-react';

export default function FreeTicketGenerator() {
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setGenerating(true);

    try {
      const response = await fetch('/api/admin/generate-free-ticket', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCode(data.code);
      } else {
        alert('Fehler: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Fehler beim Generieren');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '1rem',
      marginBottom: '1.5rem',
    }}>
      <h4 style={{
        color: '#a78bfa',
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Gift style={{ width: '18px', height: '18px' }} />
        Freikarte generieren
      </h4>

      {generatedCode ? (
        <div>
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <code style={{
              color: '#a78bfa',
              fontSize: '1rem',
              fontWeight: '600',
              letterSpacing: '0.05em',
            }}>
              {generatedCode}
            </code>
            <motion.button
              onClick={copyToClipboard}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {copied ? (
                <Check style={{ width: '16px', height: '16px', color: '#4ade80' }} />
              ) : (
                <Copy style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
              )}
            </motion.button>
          </div>
          <motion.button
            onClick={() => setGeneratedCode('')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Neuen Code generieren
          </motion.button>
        </div>
      ) : (
        <motion.button
          onClick={generateCode}
          disabled={generating}
          whileHover={{ scale: generating ? 1 : 1.02 }}
          whileTap={{ scale: generating ? 1 : 0.98 }}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: generating 
              ? 'rgba(139, 92, 246, 0.5)'
              : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            cursor: generating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <Gift style={{ width: '18px', height: '18px' }} />
          {generating ? 'Generiere...' : 'Code generieren'}
        </motion.button>
      )}
    </div>
  );
}
