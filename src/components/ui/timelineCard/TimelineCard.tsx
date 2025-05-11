import { useState, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

import type { TimelineCardProps } from './types';
import { TimelineCardState } from './types';

export const TimelineCard = ({
  sign,
  defaultPosition,
  defaultSize,
  aimPosition,
  className,
  toUnitsForDisplay,
  onChange,
}: TimelineCardProps) => {
  const [isResizeMode, setResizeMode] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isSelected, setSelected] = useState(false);
  const wasClickedOnTheCard = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (!wasClickedOnTheCard.current) {
        setSelected(false);
      }

      wasClickedOnTheCard.current = false;
    };

    document.addEventListener('click', handler);

    return () => document.removeEventListener('click', handler);
  }, []);

  const onClick = () => {
    wasClickedOnTheCard.current = true;
    console.log('1');
  };

  return (
    <div
      className={cn('w-full bg-[tomato]', className)}
      style={{ top: toUnitsForDisplay(position) }}
      onClick={onClick}
    >
      <div className="absolute w-full flex -translate-y-full bg-lime-50">
        {isSelected && (
          <Switch checked={isResizeMode} onCheckedChange={setResizeMode} />
        )}
      </div>
      <div
        className={cn(
          'bg-inherit w-full h-[2.5lh] text-2xs select-none overflow-y-visible transition-all rounded-2xl',
          className,
        )}
      >
        <div
          className="bg-inherit rounded-sm transition-foo"
          style={{ height: toUnitsForDisplay(size) }}
        >
          {sign}
        </div>
      </div>
    </div>
  );
};
