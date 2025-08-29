type ItemProps = React.HTMLAttributes<HTMLDivElement>;

import { cn } from '@/lib/utils';

export const Item = ({ className, ...props }: ItemProps) => {
  return <div className={cn(className, 'snap-start')} {...props} />
};
