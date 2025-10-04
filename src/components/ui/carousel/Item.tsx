import { cn } from '@/lib/utils';

type ItemProps = React.HTMLAttributes<HTMLDivElement>;

export const Item = ({ className, ...props }: ItemProps) => {
  return <div className={cn(className, 'snap-start')} {...props} />;
};
