type Card = {
  id: string;
  from: number;
  to: number;
  sign: string;
  className?: string;
};

export type CardsContainerProps = {
  cards: Card[];
  aimPosition: number;
  onChange: (card: Card) => void;
  toDisplayUnits: (n: number) => string;
};
