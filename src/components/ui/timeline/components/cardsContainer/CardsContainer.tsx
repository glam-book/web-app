import { useCallback, useState } from 'react';

import type { CardsContainerProps, Fields } from './types';

import { Card } from '../card';

export const CardsContainer = ({
  aimPosition,
  fields = new Map(),
  onSelectCard,
  onBlurCard,
  dateToDisplayUnits,
  ...rest
}: CardsContainerProps) => {
  const [selectedCardId, setSelectedCardId] = useState<string | number>();

  const blurCardHandler = useCallback(
    (fields: Fields) => {
      setSelectedCardId('');
      onBlurCard?.(fields);
    },
    [onBlurCard],
  );

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
      // aimPosition={
      //   selectedCardId === id
      //     ? aimPosition
      //     : dateToDisplayUnits(cardFields.from)
      // }
      aimPosition={Number(selectedCardId === id && aimPosition)}
      onSelectCard={selectCardHandler}
      onBlurCard={blurCardHandler}
      dateToDisplayUnits={dateToDisplayUnits}
      {...rest}
    />
  ));
};
