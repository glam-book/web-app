import { Record } from '@/schemas';

type Fields = typeof Record.Type;

export type CardProps = React.ComponentProps<'button'> & {
  convertToSpecificDisplayUnits: (n: number) => string;
  dateToDisplayUnits: (date: Date) => number;
  displayUnitsToMinutes: (units: number) => number;
  clickHandler: (fields: Fields) => void;
  aimPosition: number;
  fields: Fields;
  isSelected: boolean;
  minCardSize?: number;
};
