import { memo, useCallback, useState } from 'react';

export const CardForTheClient = memo(() => {
  const calcDisplayedFields = useCallback(
    () => ({
      top: dateToDisplayUnits(fields.from),
      size: flow(
        () => [fields.from, fields.to].map(dateToDisplayUnits),
        ([from, to]) => to - from,
      )(),
    }),
    [fields, dateToDisplayUnits],
  );

  const [displayedFields, setDisplayedFields] = useState(calcDisplayedFields);

  return 'CardForTheClient';
});
