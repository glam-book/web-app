import type { Card } from '../card';

type CardProps = React.ComponentProps<typeof Card>;

export type Fields = CardProps['fields'];

export type CardsContainerProps = Omit<CardProps, 'fields' | 'onBlurCard'> & {
  fields: Map<Fields['id'], Fields>;
};
