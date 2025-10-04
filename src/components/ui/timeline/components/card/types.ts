type Fields<T extends Record<string, unknown>> = {
  id: number;
  sign: string;
  from: Date;
  to: Date;
} & T;

export type CardProps<T extends Record<string, unknown> = {}> = {
  convertToSpecificDisplayUnits: (n: number) => string;
  dateToDisplayUnits: (date: Date) => number;
  displayUnitsToMinutes: (units: number) => number;
  clickHandler: (fields: Fields<T>) => void;
  aimPosition: number;
  fields: Fields<T>;
  isSelected: boolean;
  minCardSize?: number;
};
