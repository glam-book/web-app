import { useState, useEffect } from 'react';

export const useFreakyState = <V>(
  initialV: V,
): [V, React.Dispatch<React.SetStateAction<V>>] => {
  const [v, setV] = useState(initialV);
  useEffect(() => setV(initialV), [initialV]);
  return [v, setV];
};
