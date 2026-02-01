import { cva, type VariantProps } from 'class-variance-authority';

import * as generated from '@/components/generated/button';
import { cn } from '@/lib/utils';

const variants = cva('', {
  variants: {
    fashion: {
      fancy:
        'h-10 rounded-4xl bg-brand text-background-light border-t border-t-highlight',
      glassy:
        'h-10 rounded-4xl bg-background/80 backdrop-blur-xs text-foreground border-t border-t-highlight shadow-shadow',
    },
  },
  defaultVariants: undefined,
});

export const Button = ({
  fashion,
  variant,
  className,
  ...props
}: React.ComponentProps<typeof generated.Button> &
  VariantProps<typeof variants>) => {
  return (
    <generated.Button
      {...props}
      variant={fashion ? undefined : variant}
      className={cn(variants({ fashion, className }))}
    />
  );
};
