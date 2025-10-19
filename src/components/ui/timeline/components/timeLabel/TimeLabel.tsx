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
        // !time.endsWith('00') && 'text-transparent',
        isIntersecting && 'text-[pink]',
        className,
      )}
      dateTime={label}
    >
      <span className="text-sm font-mono">{label}</span>
    </time>
  );
};
