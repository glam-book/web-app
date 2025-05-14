type Fields = {
  sign: string;
  position: number;
  size: number;
};

export type CardProps = {
  toDisplayUnits: (n: number) => string;
  onChange?: (fields: Fields) => void;
  aimPosition: number;
  fields: Fields;
  className?: string;
};
