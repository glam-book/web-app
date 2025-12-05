import { cva, type VariantProps } from 'class-variance-authority';
import {Prettify } from '@/types';

import * as generated from '@/components/generated/button';
import { cn } from '@/lib/utils';

const buttonVariants = cva('', {
  variants: {
    variant: {
      a: 'bg-[tomato]',
    },
  },
});

type T2 = VariantProps<typeof buttonVariants>;
type T1 = VariantProps<typeof generated.buttonVariants>
type FOO = Prettify<T1 & T2>;

export const Button = ({
  variant,
  size,
  className,
  ...props
}: Omit<React.ComponentProps<typeof generated.Button>, 'variant'> &
  VariantProps<typeof buttonVariants> &
  VariantProps<typeof generated.buttonVariants>) => {
  return (
    <generated.Button
      className={cn(buttonVariants({ variant, className }))}
      variant={variant}
      {...props}
    />
  );
};
