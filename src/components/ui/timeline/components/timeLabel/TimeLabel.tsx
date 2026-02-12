import { cn } from '@/lib/utils';

type TimeLabelProps = React.HTMLAttributes<HTMLTimeElement> & {
  label: string;
  isIntersecting?: boolean;
};

export const TimeLabel = ({
  label,
  isIntersecting = false,
  className,
}: TimeLabelProps) => {
  return (
    <time
      className={cn(
        'h-[2.5lh] flex flex-col justify-center',
        // isIntersecting && 'text-red-400',
        className,
      )}
      dateTime={label}
    >
      <span className="text-xs indent-1">{label}</span>
    </time>
  );
};
