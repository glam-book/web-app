import { useContext } from 'react';

import { cn } from '@/lib/utils';
import { records } from '@/shrekServices';

import { CardContext } from './CardContext';

export const Content = ({
  className,
  children,
}: React.ComponentProps<'div'>) => {
  const { fields } = useContext(CardContext);
  const { fields: editableRightNowFields } = records.store.editableRightNow();
  const isSelected = editableRightNowFields?.id === fields.id;

  return (
    <div
      className={cn(
        'relative bg-blurable bg-card/70 min-w-full text-xs select-none transition-foo text-foreground rounded-[inherit] corner-shape-squircle',
        isSelected && 'bg-card',
        className,
      )}
    >
      <div className="pl-0.5 text-xl sticky top-0 w-full max-h-full min-h-[0.6lh] overflow-y-visible flex flex-col">
        <div className="flex-1 h-full flex items-center justify-between gap-3 overflow-y-visible">
          {children}
        </div>
      </div>
    </div>
  );
};
