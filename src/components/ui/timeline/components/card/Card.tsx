import { useState, useEffect, useRef, memo } from 'react';

import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useFreakyState } from '@/hooks';

import type { CardProps } from './types';

export const Card = memo(
  ({
    fields,
    aimPosition,
    className,
    toDisplayUnits,
    onChange,
    onSelectCard,
    onBlurCard,
  }: CardProps) => {
    console.log('card render');
    const [localFields, setLocalFields] = useFreakyState(fields);
    const [isResizeMode, setResizeMode] = useState(false);
    const [isSelected, setSelected] = useState(false);
    const wasClickedOnTheCard = useRef(false);

    useEffect(() => {
      const handler = () => {
        if (!wasClickedOnTheCard.current) {
          setSelected(false);
          onChange(localFields);
          onBlurCard?.(localFields);
        }

        wasClickedOnTheCard.current = false;
      };

      document.addEventListener('click', handler);

      return () => document.removeEventListener('click', handler);
    }, []);

    useEffect(() => {}, [isSelected]);

    useEffect(() => {
      if (isSelected) {
        console.log(aimPosition);
      }
    }, [aimPosition, isSelected]);

    const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      wasClickedOnTheCard.current = true;

      e.currentTarget.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });

      setSelected(true);
      onSelectCard?.(localFields);
    };

    return (
      <div
        role="button"
        className={cn('absolute w-full bg-[tomato]', className)}
        style={{ top: toDisplayUnits(localFields.position) }}
        onClick={onClick}
        tabIndex={0}
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
            style={{ height: toDisplayUnits(localFields.size) }}
          >
            {localFields.sign}
          </div>
        </div>
      </div>
    );
  },
);
