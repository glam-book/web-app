import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

export type DndProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

export const Dnd = ({ className, asChild = false, ...props }: DndProps) => {
  const Comp = asChild ? Slot : 'div';

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    console.log(event);
  };

  return (
    <Comp
      className={cn(className, 'absolute p-4 border border-dotted')}
      {...props}
      onTouchMove={onTouchMove}
    >
      DND
    </Comp>
  );
};
