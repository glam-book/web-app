import { useCallback, useState } from 'react';

import type { CardsContainerProps, Fields } from './types';

import { Card } from '../card';

export const CardsContainer = ({
  aimPosition,
  fields = new Map(),
  onSelectCard,
  ...rest
}: CardsContainerProps) => {
  const [selectedCardId, setSelectedCardId] = useState<string | number>();

  const blurCardHandler = useCallback(() => setSelectedCardId(''), []);

  const selectCardHandler = useCallback(
    (fields: Fields) => {
      setSelectedCardId(fields.id);
      onSelectCard?.(fields);
    },
    [onSelectCard],
  );

  return Array.from(fields, ([id, cardFields]) => (
    <Card
      key={id}
      fields={cardFields}
      aimPosition={Number(selectedCardId === id && aimPosition)}
      onSelectCard={selectCardHandler}
      onBlurCard={blurCardHandler}
      {...rest}
    />
  ));
};
