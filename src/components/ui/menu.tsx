import { type PropsWithChildren } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';

import { RadioGroup } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export const Menu = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof RadioGroup>) => {
  return (
    <RadioGroup
      {...props}
      className={cn(
        'overflow-auto rounded-md border-2 drop-shadow-2xl bg-white mb-4 gap-0 [&>*+*]:border-t empty:hidden',
        className,
      )}
    >
      {children}
    </RadioGroup>
  );
};

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-green-600 stroke-blurable absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export const MenuItem = (
  props: React.ComponentProps<typeof RadioGroupItem>,
) => {
  return <RadioGroupItem {...props} />;
};
