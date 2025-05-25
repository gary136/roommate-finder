import React, { useState, useEffect } from 'react';
import { MousePosition } from '../types';

const BackgroundShapes: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-shapes">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="shape"
          style={{
            transform: `translate(${mousePosition.x * (index + 1) * 0.5}px, ${
              mousePosition.y * (index + 1) * 0.5
            }px)`,
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundShapes;