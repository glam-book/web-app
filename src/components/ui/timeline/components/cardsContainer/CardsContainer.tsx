import { useCallback, useMemo, useState } from 'react';

import type { CardsContainerProps } from './types';

import { Card } from '../card';

type Fields = React.ComponentProps<typeof Card>['fields'];

export const CardsContainer = ({
  aimPosition,
  cards = [],
  onChange: onChangeHandler,
  toDisplayUnits,
}: CardsContainerProps) => {
  console.log('cards container render');
  const [selectedCardId, setSelectedCardId] = useState('');

  const onSelectCard = useCallback(
    (fields: Fields) => setSelectedCardId(fields.id),
    [],
  );

  const onBlurCard = useCallback(() => setSelectedCardId(''), []);

  const onChange = useCallback(
    ({ position, size, sign, id }: Fields) =>
      onChangeHandler({
        id,
        sign,
        from: position,
        to: position + size,
      }),
    [onChangeHandler],
  );

  const cardsFileds: Map<string, Fields> = useMemo(
    () =>
      new Map(
        cards.map(({ id, sign, from, to }) => [
          id,
          {
            id,
            sign,
            size: to - from,
            position: from,
          },
        ]),
      ),
    [cards],
  );

  return cards.map(({ id, className }) => (
    <Card
      key={id}
      fields={cardsFileds.get(id)!}
      aimPosition={selectedCardId === id ? aimPosition : 0}
      className={className}
      toDisplayUnits={toDisplayUnits}
      onChange={onChange}
      onSelectCard={onSelectCard}
      onBlurCard={onBlurCard}
    />
  ));
};
