import { useEffect, useState, useRef } from 'react';

export default function DecryptedText({
  text = '',
  speed = 40,
  maxIterations = 10,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  className = '',
  parentClassName = '',
  encryptedClassName = 'text-primary/70 font-mono',
  animateOn = 'view',
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }

      iteration += 1 / maxIterations;
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'view' && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.unobserve(containerRef.current);
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } else {
      startAnimation();
    }
  }, [text]);

  return (
    <span
      ref={containerRef}
      onMouseEnter={() => {
        if (animateOn === 'hover') startAnimation();
      }}
      className={`inline-block ${parentClassName}`}
      {...props}
    >
      <span className={isAnimating ? encryptedClassName : className}>
        {displayText}
      </span>
    </span>
  );
}
