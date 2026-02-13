'use client';

import { useEffect, useRef, useState } from 'react';

interface VaraTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  duration?: number;
}

export default function VaraText({ 
  text, 
  fontSize = 80, 
  color = '#b8b8b8',
  duration = 3000 
}: VaraTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerId] = useState(() => `vara-${Date.now()}`);
  const varaInstanceRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById(containerId);
      
      if (!element) return;

      element.innerHTML = '';

      if (varaInstanceRef.current) {
        varaInstanceRef.current = null;
      }

      import('vara').then((VaraModule) => {
        const Vara = VaraModule.default;

        try {
          varaInstanceRef.current = new Vara(
            `#${containerId}`,
            // PACIFICO FONT! 🎨
            "https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Pacifico/PacificoSLO.json",
            [
              {
                text: text,
                fontSize: fontSize,
                strokeWidth: 1.5,
                color: color,
                duration: duration,
                textAlign: "center",
              }
            ]
          );
        } catch (error) {
          console.error('Vara error:', error);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (varaInstanceRef.current) {
        varaInstanceRef.current = null;
      }
    };
  }, [text, fontSize, color, duration, containerId]);

  return (
    <div 
      id={containerId}
      ref={containerRef} 
      style={{ 
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }} 
    />
  );
}