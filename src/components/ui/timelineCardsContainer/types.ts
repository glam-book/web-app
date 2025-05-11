type Card = {
  id: string;
  from: number;
  to: number;
  sign: string;
  className?: string;
};

export type TimelineCardsContainerProps = {
  cards: Card[];
  aimPosition: number;
  onChange: (card: Card) => void;
  toUnitsForDisplay: (n: number) => unknown;
};
