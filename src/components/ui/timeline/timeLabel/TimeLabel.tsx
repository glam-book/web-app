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
        className,
        'h-[2.5lh] flex flex-col justify-center',
        // !time.endsWith('00') && 'text-transparent',
        isIntersecting && 'text-[pink]',
      )}
      dateTime={label}
    >
      <span className="translate-y-[calc(-2.5lh/2)]">{label}</span>
    </time>
  );
};
