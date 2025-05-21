import type { MapValueType } from '@/types';
import type { CardsContainer } from './components/cardsContainer';

export type Cards = React.ComponentProps<typeof CardsContainer>['fields'];

export type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  onCardChange: (card: MapValueType<Cards>) => void;
  asChild?: boolean;
  cards?: Cards;
  sectionDisplaySize?: number;
  sectionSizeInMinutes?: number;
};
