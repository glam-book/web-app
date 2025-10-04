import type { Container } from './components/container';

export type Cards = React.ComponentProps<typeof Container>['fields'];

export type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  currentDate?: Date;
  asChild?: boolean;
  cards?: Cards;
  sectionDisplaySize?: number;
  sectionSizeInMinutes?: number;
};
