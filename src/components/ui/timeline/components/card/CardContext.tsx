import { createContext, type PropsWithChildren } from 'react';
import type { CardProps } from './types';

export const CardContext = createContext<{
  fields: CardProps['fields'];
}>({
  fields: {} as unknown as CardProps['fields'],
});

export const Root = ({
  children,
  fields,
}: PropsWithChildren<Pick<CardProps, 'fields'>>) => {
  return (
    <CardContext.Provider value={{ fields }}>{children}</CardContext.Provider>
  );
};
