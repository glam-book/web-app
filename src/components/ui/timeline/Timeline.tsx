import { Slot } from '@radix-ui/react-slot';

export type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

export const Timeline = ({
  className,
  asChild = false,
  children,
  ...props
}: TimelineProps) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp className={className} {...props}>
      {Array.from({ length: 24 }, (_, idx) => {
        const time = `${String(idx).padStart(2, '0')}:00`;

        return (
          <div key={idx} className="flex gap-1">
            <time
              className="h-10lh flex flex-col text-2xs translate-y-[-0.5lh]"
              dateTime={time}
            >
              {time}
            </time>
            <div className="flex-1 flex flex-col">
              {Array.from({ length: 4 }, (_, idxx) => (
                <div key={idxx} className="flex-1 border-t border-dashed" />
              ))}
            </div>
          </div>
        );
      })}
    </Comp>
  );
};
