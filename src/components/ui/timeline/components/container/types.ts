import type { CardProps } from '../card';

export type Fields = CardProps['fields'];

export type ContainerProps = Omit<CardProps, 'fields' | 'isSelected'> & {
  fields: Map<Fields['id'], Fields>;
};
