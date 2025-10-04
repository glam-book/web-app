import type { Card } from '../card';

type CardProps = React.ComponentProps<typeof Card>;

export type Fields = CardProps['fields'];

export type ContainerProps = Omit<CardProps, 'fields' | 'isSelected'> & {
  fields: Map<Fields['id'], Fields>;
};
