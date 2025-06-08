type Fields = {
  id: number;
  sign: string;
  from: Date;
  to: Date;
}

export type CardProps = {
  convertToSpecificDisplayUnits: (n: number) => string;
  dateToDisplayUnits: (date: Date) => number;
  displayUnitsToMinutes: (units: number) => number;
  onChange: (fields: Fields) => unknown;
  onSelectCard?: (fields: Fields) => unknown;
  onBlurCard?: (fields: Fields) => unknown;
  onToggleResizeMode: (fields: Fields, isResizeMode: boolean) => unknown;
  aimPosition: number;
  fields: Fields;
  isSelected: boolean;
  minCardSize?: number;
};
