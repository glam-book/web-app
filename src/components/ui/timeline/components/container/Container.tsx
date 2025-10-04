import { useEffect, useMemo } from 'react';

import { recordCards } from '@/shrekServices';

import type { ContainerProps, Fields } from './types';

import { Card } from '../card';

export const Container = ({ fields = new Map(), ...rest }: ContainerProps) => {
  const selectedCardState = recordCards.store.editableRightNow();

  const fieldList = useMemo(
    () =>
      // [
      Array.from(fields, ([_, v]) => v),
    // selectedCardState.isNew && selectedCardState.fields,
    // ]
    // .filter(Boolean),
    [
      fields,
      // , selectedCardState.fields
    ],
  ) as Fields[];

  useEffect(() => {
    console.log('container:::', { fieldList, size: fieldList.length });
  }, [fieldList]);

  return fieldList.map(cardFields => (
    <Card
      key={cardFields.id}
      fields={cardFields}
      isSelected={
        cardFields.id === selectedCardState.fields?.id &&
        selectedCardState.isUnfreezed
      }
      {...rest}
    />
  ));
};
