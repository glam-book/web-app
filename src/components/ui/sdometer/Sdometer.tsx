import { Fragment, memo, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

type SdometerProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number | string;
  asChild?: boolean;
};

const Item = memo(({ val }: { val: string }) => {
  return (
    <span className="min-w-[1ch] min-h-[1lh] flex">
      <span
        className="flex flex-col transition-all duration-500"
        style={{ translate: `0 -${val}lh` }}
      >
        <span className="h-[1lh]">0</span>
        <span className="h-[1lh]">1</span>
        <span className="h-[1lh]">2</span>
        <span className="h-[1lh]">3</span>
        <span className="h-[1lh]">4</span>
        <span className="h-[1lh]">5</span>
        <span className="h-[1lh]">6</span>
        <span className="h-[1lh]">7</span>
        <span className="h-[1lh]">8</span>
        <span className="h-[1lh]">9</span>
      </span>
    </span>
  );
});

export const Sdometer = ({ value, asChild, className }: SdometerProps) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp className={cn(className, 'inline-flex overflow-hidden h-[1lh]')}>
      {String(value)
        .split('')
        .map((val, index) => (
          <Fragment key={index}>
            {/\d/.test(val) ? <Item val={val} /> : val}
          </Fragment>
        ))}
    </Comp>
  );
};
