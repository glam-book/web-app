import { useEffect, useMemo } from 'react';

import { records } from '@/shrekServices';
import { activeCard } from '@/components/ui/timeline/store';

import type { ContainerProps, Fields } from './types';

import { Card } from '../card';

export const Container = ({ fields = new Map(), ...rest }: ContainerProps) => {
  const selectedCardState = records.store.editableRightNow();
  const activeCardState = activeCard();

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

  return fieldList.map(cardFields => (
    <Card
      key={cardFields.id}
      fields={cardFields}
      isSelected={
        cardFields.id === selectedCardState.fields?.id &&
        activeCardState.isUnfreezed
      }
      {...rest}
    />
  ));
};
