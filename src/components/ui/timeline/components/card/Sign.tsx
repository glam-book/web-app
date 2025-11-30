import { useContext } from 'react';
import { CardContext } from './CardContext';

export const Sign = () => {
  const { fields } = useContext(CardContext);

  return (
    <p className="text-foreground text-left empty:hidden">{fields.sign}</p>
  );
};
