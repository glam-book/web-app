import type { CardsContainerProps } from './types';

import { Card } from '../card';

export const CardsContainer = ({
  aimPosition,
  cards = [],
  onChange,
  toDisplayUnits,
}: CardsContainerProps) => {
  console.log('cards container render');
  return cards.map(({ id, sign, from, to, className }) => (
    <Card
      key={id}
      fields={{
        size: to - from,
        position: from,
        sign,
      }}
      aimPosition={aimPosition}
      className={className}
      toDisplayUnits={toDisplayUnits}
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
