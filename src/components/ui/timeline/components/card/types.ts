type Fields = {
  id: string;
  sign: string;
  position: number;
  size: number;
};

export type CardProps = {
  toDisplayUnits: (n: number) => string;
  onChange: (fields: Fields) => void;
  onSelectCard?: (fields: Fields) => void;
  onBlurCard?: (fields: Fields) => void;
  onToggleResizeMode: (isResizeMode: boolean, fields: Fields) => void;
  aimPosition: number;
  fields: Fields;
  minCardSize?: number;
};
