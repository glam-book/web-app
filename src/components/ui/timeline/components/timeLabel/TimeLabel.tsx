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
        'w-[4ch] flex flex-col justify-start items-end-safe',
        className,
        isIntersecting && 'text-red-400 font-semibold',
      )}
      dateTime={label}
    >
      <span className="text-xs indent-1">{label}</span>
    </time>
  );
};
