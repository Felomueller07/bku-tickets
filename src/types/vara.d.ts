declare module 'vara' {
  interface VaraTextProperties {
    text: string;
    fontSize?: number;
    strokeWidth?: number;
    color?: string;
    duration?: number;
    textAlign?: 'left' | 'center' | 'right';
    autoAnimation?: boolean;
    queued?: boolean;
    delay?: number;
    letterSpacing?: number;
  }

  class Vara {
    constructor(
      element: HTMLElement | string,
      fontSource: string,
      textProperties: VaraTextProperties[]
    );
    
    draw(text: string, speed?: number): void;
    animationEnd(callback: () => void): void;
    playAll(): void;
    ready(callback: () => void): void;
  }

  export default Vara;
}