import { useCallback, useEffect, useState, useMemo } from 'react';

import type { CardsContainerProps, Fields } from './types';

import { Card } from '../card';

export const CardsContainer = ({
  // aimPosition,
  fields = new Map(),
  onSelectCard,
  onBlurCard,
  dateToDisplayUnits,
  selectedId,
  isResizeMode,
  isFreezed,
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
      // aimPosition={aimPosition}
      // onSelectCard={selectCardHandler}
      // onBlurCard={blurCardHandler}
      dateToDisplayUnits={dateToDisplayUnits}
      // isSelected={!isFreezed && selectedId === cardFields.id}
      // isResizeMode={selectedId === cardFields.id && isResizeMode}
      {...rest}
    />
  ));
};
