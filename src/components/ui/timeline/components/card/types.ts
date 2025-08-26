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
  aimPosition: number;
  fields: Fields;
  minCardSize?: number;
};
