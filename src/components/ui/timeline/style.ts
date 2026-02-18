import { cva } from 'class-variance-authority';

export const sizes = {
  sm: 0.7,
} as const;

export const defaultSize = 'sm' satisfies keyof typeof sizes;

export const timeLineVariants = cva('', {
  variants: {
    size: {
      sm: 'h-[1lh] text-base',
    },
    contentSize: {
      sm: 'h-[calc(1lh-var(--spacing)*1)] text-base',
    },
  },
  defaultVariants: {
    size: defaultSize,
  },
});
