import React, { useEffect, useState, useRef } from 'react';

export default function BlurText({
  text = '',
  delay = 50,
  className = '',
  animateBy = 'words',
  direction = 'top',
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  useEffect(() => {
    // Immediate fallback so text is never invisible
    const timer = setTimeout(() => setInView(true), 50);

    if (ref.current && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(ref.current);
      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }
    return () => clearTimeout(timer);
  }, []);

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {elements.map((segment, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-700 ease-out"
          style={{
            transitionDelay: `${index * delay}ms`,
            opacity: inView ? 1 : 0,
            transform: inView
              ? 'translateY(0)'
              : direction === 'top'
              ? 'translateY(-12px)'
              : 'translateY(12px)',
            filter: inView ? 'blur(0px)' : 'blur(8px)',
          }}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
}
