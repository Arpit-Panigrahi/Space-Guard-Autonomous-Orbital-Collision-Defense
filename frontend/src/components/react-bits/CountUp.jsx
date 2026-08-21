import React, { useEffect, useState, useRef } from 'react';

export default function CountUp({
  to = 0,
  from = 0,
  duration = 1.8,
  delay = 0,
  className = '',
  separator = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}) {
  const [displayValue, setDisplayValue] = useState(from);
  const ref = useRef(null);

  const formatNumber = (num) => {
    const fixed = Number(num).toFixed(decimals);
    if (!separator) return fixed;
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };

  useEffect(() => {
    let startTime = null;
    let animationFrameId = null;

    const timeout = setTimeout(() => {
      const startAnim = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        // Smooth cubic ease-out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = from + (to - from) * easeOut;

        setDisplayValue(current);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(startAnim);
        } else {
          setDisplayValue(to);
        }
      };

      animationFrameId = requestAnimationFrame(startAnim);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [to, from, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
}
