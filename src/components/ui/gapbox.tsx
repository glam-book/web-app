// GapBorderBox.tsx
import React from 'react';

interface GapBorderBoxProps {
  children: React.ReactNode;
  gapSize?: number;     // размер пробела по центру (px)
  borderWidth?: number; // толщина линии (px)
  color?: string;       // цвет в hex или CSS-именах, например '#000' или 'currentColor'
  className?: string;
  size?: string;        // например 'w-64 h-64'
}

export const GapBorderBox: React.FC<GapBorderBoxProps> = ({
  children,
  gapSize = 24,
  borderWidth = 2,
  color = 'black',
  className = '',
  size = 'w-64 h-64',
}) => {
  const halfGap = gapSize / 2;
  const style = { backgroundColor: color };

  return (
    <div className={`relative ${size} ${className}`}>
      {/* Горизонтальные линии */}
      <div
        className="absolute top-0 left-0"
        style={{ width: `calc(50% - ${halfGap}px)`, height: `${borderWidth}px`, ...style }}
      />
      <div
        className="absolute top-0 right-0"
        style={{ width: `calc(50% - ${halfGap}px)`, height: `${borderWidth}px`, ...style }}
      />
      <div
        className="absolute bottom-0 left-0"
        style={{ width: `calc(50% - ${halfGap}px)`, height: `${borderWidth}px`, ...style }}
      />
      <div
        className="absolute bottom-0 right-0"
        style={{ width: `calc(50% - ${halfGap}px)`, height: `${borderWidth}px`, ...style }}
      />

      {/* Вертикальные линии */}
      <div
        className="absolute left-0 top-0"
        style={{ width: `${borderWidth}px`, height: `calc(50% - ${halfGap}px)`, ...style }}
      />
      <div
        className="absolute left-0 bottom-0"
        style={{ width: `${borderWidth}px`, height: `calc(50% - ${halfGap}px)`, ...style }}
      />
      <div
        className="absolute right-0 top-0"
        style={{ width: `${borderWidth}px`, height: `calc(50% - ${halfGap}px)`, ...style }}
      />
      <div
        className="absolute right-0 bottom-0"
        style={{ width: `${borderWidth}px`, height: `calc(50% - ${halfGap}px)`, ...style }}
      />

      {/* Контент поверх */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};