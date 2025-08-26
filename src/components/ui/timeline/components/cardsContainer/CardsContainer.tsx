import { useMemo } from 'react';

import type { CardsContainerProps, Fields } from './types';

import { Card } from '../card';

export const CardsContainer = ({
  fields = new Map(),
  dateToDisplayUnits,
  tmpFields,
  ...rest
}: CardsContainerProps) => {
  const fieldsList = useMemo(
    () => [...Array.from(fields, ([, cf]) => cf), tmpFields].filter(Boolean),
    [fields, tmpFields],
  ) as Fields[];

  return fieldsList.map((cardFields) => (
    <Card
      key={cardFields.id}
      fields={cardFields}
      dateToDisplayUnits={dateToDisplayUnits}
      {...rest}
    />
  ));
};
