type Card = {
  id: string;
  sign: string;
  from: Date;
  to: Date;
}

export type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  cards?: Card[];
  sectionDisplaySize?: number;
  sectionSizeInMinutes?: number;
  onChange?: (card: Card) => void;
};

