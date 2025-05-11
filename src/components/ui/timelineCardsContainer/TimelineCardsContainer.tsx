import { TimelineCard } from '@/components/ui/timelineCard';

import type { TimelineCardsContainerProps } from './types';

export const TimelineCardsContainer = ({
  aimPosition,
  cards = [],
  onChange,
  toUnitsForDisplay,
}: TimelineCardsContainerProps) => {
  return cards.map(({ id, sign, from, to, className }) => (
    <TimelineCard
      key={id}
      sign={sign}
      aimPosition={aimPosition}
      defaultPosition={from}
      defaultSize={to - from}
      className={className}
      toUnitsForDisplay={toUnitsForDisplay}
      onChange={({ position, size }) =>
        onChange({
          id,
          sign,
          from: position,
          to: position + size,
        })
      }
    />
  ));
};
