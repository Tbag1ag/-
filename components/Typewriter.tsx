import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  className = "", 
  speed = 100, 
  delay = 500 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, started]);

  return (
    <h1 className={className}>
      {displayedText}
      <span className="animate-blink ml-1 inline-block w-[4px] h-[0.8em] bg-[#007acc] align-middle mb-2"></span>
    </h1>
  );
};