import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

type HostProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

export const Host = ({ children, asChild, className, ...props }: HostProps) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      className={cn(className, 'overflow-x-auto flex snap-mandatory snap-x')}
      {...props}
    >
      {children}
    </Comp>
  );
};
