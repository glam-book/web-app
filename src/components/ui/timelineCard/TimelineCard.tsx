import { cn } from '@/lib/utils';

import type { TimelineCardProps } from './types';

export const TimelineCard = ({
  sign,
  topPositionLh,
  sizeLh,
  className,
  onClick,
}: TimelineCardProps) => {
  return (
    <div
      className={cn(
        'bg-[tomato] absolute w-full h-[2.5lh] text-2xs select-none overflow-y-visible transition-all rounded-2xl',
        className,
      )}
      style={{ top: `${topPositionLh}lh` }}
      onClick={onClick}
    >
      <div className="bg-inherit rounded-sm" style={{ height: `${sizeLh}lh` }}>
        {sign}
      </div>
    </div>
  );
};
