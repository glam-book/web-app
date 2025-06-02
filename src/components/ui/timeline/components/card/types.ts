type Fields = {
  id: number;
  sign: string;
  from: Date;
  to: Date;
}

export type CardProps = {
  convertToSpecificDisplayUnits: (n: number) => string;
  minutesToDisplayUnits: (minutes: number) => number;
  displayUnitsToMinutes: (units: number) => number;
  onChange: (fields: Fields) => void;
  onSelectCard?: (fields: Fields) => void;
  onBlurCard?: (fields: Fields) => void;
  onToggleResizeMode: (fields: Fields, isResizeMode: boolean) => void;
  aimPosition: number;
  fields: Fields;
  minCardSize?: number;
};
