import { useMemo } from 'react';

import { records, owner } from '@/shrekServices';
import { activeCard } from '@/components/ui/timeline/store';

import type { ContainerProps } from './types';

import { OwnerCard, ClientCard } from '../card';

export const Container = ({ fields = new Map(), ...rest }: ContainerProps) => {
  const selectedCardState = records.store.editableRightNow();
  const activeCardState = activeCard();

  const fieldList = useMemo(() => Array.from(fields, ([_, v]) => v), [fields]);

  const ownerResult = owner.useIsOwner();
  const Comp = ownerResult.isOwner ? OwnerCard : ClientCard;
  console.debug({ isOwnerInContainer: ownerResult.isOwner });

  return (
    ownerResult.isFetched &&
    fieldList.map(cardFields => (
      <Comp
        key={cardFields.id}
        fields={cardFields}
        isSelected={
          cardFields.id === selectedCardState.fields?.id &&
          activeCardState.isUnfreezed
        }
        {...rest}
      />
    ))
  );
};
