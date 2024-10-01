import { useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';
import { closest } from '@/utils/closest';

export type DndProps = React.HTMLAttributes<HTMLDivElement> & {
  onStart?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onMove?: (event: React.TouchEvent<HTMLDivElement>) => void;
  validatePositionY?: (y: number) => number | ((y: number) => number)[];
  asChild?: boolean;
};

export const Dnd = ({
  onStart,
  onMove,
  validatePositionY = (a: number) => a,
  className,
  asChild = false,
  ...props
}: DndProps) => {
  const Comp = asChild ? Slot : 'div';
  const shiftY = useRef(0);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget;
    const rect = box.getBoundingClientRect();

    shiftY.current = event.clientY - rect.top;
    onStart?.(event);
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touchLocation = event.targetTouches[0];
    const box = event.currentTarget;
    const relativeParent = closest(
      (element) => window.getComputedStyle(element).position === 'relative',
      box
    );
    const parentRect = relativeParent?.getBoundingClientRect();
    const yCandidate =
      touchLocation.pageY -
      ((parentRect?.top ?? 0) + window.scrollY) -
      shiftY.current;
    const y = Array.isArray(validatePositionY)
      ? validatePositionY.reduce((y, validator) => validator(y), yCandidate)
      : validatePositionY(yCandidate);

    box.style.top = `${y}px`;
    onMove?.(event);
  };

  return (
    <Comp
      className={cn(
        className,
        `absolute p-4 w-full border border-dotted touch-none`
      )}
      {...props}
      onPointerDown={onPointerDown}
      onTouchMove={onTouchMove}
    />
  );
};
