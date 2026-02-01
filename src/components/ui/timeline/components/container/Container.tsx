import { useMemo } from 'react';

import { records, owner } from '@/shrekServices';

import type { ContainerProps } from './types';

import { OwnerCard, ClientCard } from '../card';

export const Container = ({
  fields = new Map(),
  aimPosition,
  ...rest
}: ContainerProps) => {
  const selectedCardState = records.store.editableRightNow();
  const fieldList = useMemo(() => Array.from(fields, ([_, v]) => v), [fields]);
  const ownerResult = owner.useIsOwner();
  const Card = ownerResult.isOwner ? OwnerCard : ClientCard;

  return (
    <>
      {ownerResult.isFetched &&
        fieldList.map(cardFields => (
          <Card
            key={cardFields.id}
            fields={cardFields}
            aimPosition={
              selectedCardState.fields?.id === cardFields.id ? aimPosition : 0
            }
            {...rest}
          />
        ))}
    </>
  );
};
