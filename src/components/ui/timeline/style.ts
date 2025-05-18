import { cva } from 'class-variance-authority';

export const timeLine = cva('', {
  variants: {
    size: {
      default: '',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const dummy: typeof timeLine = cva('', {
  variants: {
    size: {
      default: 'h-[1.25lh]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const timeLabel: typeof timeLine = cva('', {
  variants: {
    size: {
      default: '[&>*:first-child]:h-[1.25lh]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});
