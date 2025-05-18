import { useCallback, useMemo, useState } from 'react';

import type { CardsContainerProps, Card as ContainerCardType } from './types';

import { Card } from '../card';

type Fields = React.ComponentProps<typeof Card>['fields'];

export const CardsContainer = <T,>({
  aimPosition,
  cards = [],
  onChange: onChangeHandler,
  onSelect: onSelectHandler,
  onToggleResizeMode,
  toDisplayUnits,
}: CardsContainerProps<T>) => {
  const [selectedCardId, setSelectedCardId] = useState('');

  const onBlurCard = useCallback(() => setSelectedCardId(''), []);

  const convertToFields = useCallback(
    ({ from, to, id, sign }: ContainerCardType<T>): Fields => ({
      id,
      sign,
      size: to - from,
      position: from,
    }),
    [],
  );

  const cardsAndFieldsMap: Map<
    string,
    { card: ContainerCardType<T>; fields: Fields }
  > = useMemo(
    () =>
      new Map(
        cards.map((card) => [card.id, { card, fields: convertToFields(card) }]),
      ),
    [cards, convertToFields],
  );

  const onSelectCard = useCallback(
    (fields: Fields) => {
      setSelectedCardId(fields.id);
      onSelectHandler(cardsAndFieldsMap.get(fields.id)!.card);
    },
    [cardsAndFieldsMap, onSelectHandler],
  );

  const onChange = useCallback(
    ({ id, position, size, ...rest }: Fields) =>
      onChangeHandler({
        ...cardsAndFieldsMap.get(id)!.card,
        ...rest,
        id,
        from: position,
        to: position + size,
      }),
    [onChangeHandler, cardsAndFieldsMap],
  );

  const toggleResizeModeHandler = (isResizeMode: boolean, fields: Fields) => {
    onToggleResizeMode(isResizeMode, {
      ...cardsAndFieldsMap.get(fields.id)!.card,
      from: fields.position,
      to: fields.position + fields.size,
    });
  };

  return cards.map(({ id }) => (
    <Card
      key={id}
      fields={cardsAndFieldsMap.get(id)!.fields}
      aimPosition={Number(selectedCardId === id && aimPosition)}
      toDisplayUnits={toDisplayUnits}
      onChange={onChange}
      onSelectCard={onSelectCard}
      onBlurCard={onBlurCard}
      onToggleResizeMode={toggleResizeModeHandler}
    />
  ));
};
