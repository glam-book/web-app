import { useCallback, useMemo, useState } from 'react';

import type { CardsContainerProps, Card as ContainerCardType } from './types';

import { Card } from '../card';

type Fields = React.ComponentProps<typeof Card>['fields'];

export const CardsContainer = ({
  aimPosition,
  cards = [],
  onChange: onChangeHandler,
  onSelect: onSelectHandler,
  onToggleResizeMode,
  toDisplayUnits,
}: CardsContainerProps) => {
  const [selectedCardId, setSelectedCardId] = useState('');

  const onBlurCard = useCallback(() => setSelectedCardId(''), []);

  const convertToFields = useCallback(
    ({ from, to, id, sign, ...rest }: ContainerCardType): Fields => ({
      ...rest,
      id,
      sign,
      size: to - from,
      position: from,
    }),
    [],
  );

  const cardsAndFieldsMap: Map<
    string,
    { card: ContainerCardType; fields: Fields }
  > = useMemo(
    () =>
      new Map(
        cards.map((card) => [card.id, { card, fields: convertToFields(card) }]),
      ),
    [cards, convertToFields],
  );

  const convertToCard = useCallback(
    ({ id, position, size, ...rest }: Fields): ContainerCardType => ({
      ...cardsAndFieldsMap.get(id)!.card,
      ...rest,
      id,
      from: position,
      to: position + size,
    }),
    [cardsAndFieldsMap],
  );

  const onSelectCard = useCallback(
    (fields: Fields) => {
      setSelectedCardId(fields.id);
      onSelectHandler(convertToCard(fields));
    },
    [onSelectHandler, convertToCard],
  );

  const onChange = useCallback(
    (fields: Fields) => onChangeHandler(convertToCard(fields)),
    [onChangeHandler, convertToCard],
  );

  const toggleResizeModeHandler = useCallback(
    (isResizeMode: boolean, fields: Fields) => {
      onToggleResizeMode(isResizeMode, convertToCard(fields));
    },
    [convertToCard, onToggleResizeMode],
  );

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
