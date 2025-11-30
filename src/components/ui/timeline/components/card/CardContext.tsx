import { createContext, type PropsWithChildren } from 'react';
import type { CardProps } from './types';

export const CardContext = createContext<{
  fields: CardProps['fields'];
  isSelected: CardProps['isSelected'];
}>({
  fields: {} as unknown as CardProps['fields'],
  isSelected: false,
});

export const Root = ({
  children,
  fields,
  isSelected,
}: PropsWithChildren<Pick<CardProps, 'isSelected' | 'fields'>>) => {
  return <CardContext.Provider value={{ fields, isSelected }}>{children}</CardContext.Provider>;
};
