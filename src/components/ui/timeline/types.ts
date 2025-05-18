type Card = {
  id: string;
  sign: string;
  from: Date;
  to: Date;
}

export type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  onCardChange: (card: Card) => void;
  asChild?: boolean;
  cards?: Card[];
  sectionDisplaySize?: number;
  sectionSizeInMinutes?: number;
};

