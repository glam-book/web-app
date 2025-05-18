export type Card<T> = {
  id: string;
  from: number;
  to: number;
  sign: string;
} & T;

export type CardsContainerProps<T> = {
  cards: Card<T>[];
  aimPosition: number;
  onChange: (card: Card<T>) => void;
  onSelect: (card: Card<T>) => void;
  onToggleResizeMode: (isResizeMode: boolean, card: Card<T>) => void;
  toDisplayUnits: (n: number) => string;
};
