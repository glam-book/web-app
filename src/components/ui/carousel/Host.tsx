import { useImperativeHandle, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

export type HostApi = { next: (idx: number) => void };

type HostProps = React.HTMLAttributes<HTMLDivElement> & {
  ref: React.Ref<HostApi>;
  asChild?: boolean;
};

export const Host = ({
  ref,
  children,
  asChild,
  className,
  ...props
}: HostProps) => {
  const Comp = asChild ? Slot : 'div';

  const hostRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      next: (idx: number) => {
        if (!hostRef.current) return;
        const rect = hostRef.current.getBoundingClientRect();
        hostRef.current.scroll({
          left: rect.width * idx,
          top: 0,
          behavior: 'smooth',
        });
      },
    }),
    [],
  );

  return (
    <Comp
      ref={hostRef}
      className={cn('overflow-x-auto flex snap-mandatory snap-x', className)}
      {...props}
    >
      {children}
    </Comp>
  );
};
