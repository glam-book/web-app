import { useMemo } from 'react';

import { records, owner } from '@/shrekServices';
import { activeCard } from '@/components/ui/timeline/store';

import type { ContainerProps } from './types';

import { OwnerCard, ClientCard } from '../card';

export const Container = ({
  fields = new Map(),
  aimPosition,
  ...rest
}: ContainerProps) => {
  const selectedCardState = records.store.editableRightNow();
  const activeCardState = activeCard();

  const fieldList = useMemo(() => Array.from(fields, ([_, v]) => v), [fields]);

  const ownerResult = owner.useIsOwner();
  const Comp = ownerResult.isOwner ? OwnerCard : ClientCard;

  return (
    ownerResult.isFetched &&
    fieldList.map(cardFields => {
      const isSelected =
        cardFields.id === selectedCardState.fields?.id &&
        activeCardState.isUnfreezed;

      return (
        <Comp
          key={cardFields.id}
          fields={cardFields}
          isSelected={isSelected}
          aimPosition={isSelected ? aimPosition : 0}
          {...rest}
        />
      );
    })
  );
};
