export type Card = {
  id: string;
  from: number;
  to: number;
  sign: string;
  dateFrom: Date;
  dateTo: Date;
};

export type CardsContainerProps = {
  cards: Card[];
  aimPosition: number;
  onChange: (card: Card) => void;
  onSelect: (card: Card) => void;
  onToggleResizeMode: (isResizeMode: boolean, card: Card) => void;
  toDisplayUnits: (n: number) => string;
};
