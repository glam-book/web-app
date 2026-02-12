import { useContext, useMemo } from 'react';
import { format } from 'date-fns';

import { Sdometer } from '@/components/ui/sdometer';
import { activeCard } from '@/components/ui/timeline/store';
import { cn } from '@/lib/utils';
import { records } from '@/shrekServices';

import { CardContext } from './CardContext';

export const Content = ({
  className,
  children,
}: React.ComponentProps<'div'>) => {
  const { fields } = useContext(CardContext);
  const { fields: editableRightNowFields } = records.store.editableRightNow();
  const { isResizeMode } = activeCard();
  const isSelected = editableRightNowFields?.id === fields.id;

  return (
    <div
      className={cn(
        'relative bg-blurable bg-card/90 min-w-full min-h-[2.5lh] text-2xs select-none transition-foo text-foreground rounded-[inherit]',
        isSelected && 'bg-accent-strong/80',
        className,
      )}
    >
      <div className="px-0.5 py-1 text-2xl sticky top-0 w-full max-h-full overflow-y-hidden flex flex-col">
        {isSelected ? (
          <div className="flex font-mono text-xl">
            <time
              className={cn(
                'text-foreground inline-flex',
                isResizeMode || 'text-current',
              )}
              dateTime={format(String(editableRightNowFields?.from), 'MM-dd')}
            >
              <Sdometer
                value={format(String(editableRightNowFields?.from), 'HH:mm')}
              />
            </time>
            <span className="text-foreground">-</span>
            <time
              className={cn(
                'text-foreground inline-flex',
                isResizeMode && 'text-current',
              )}
              dateTime={format(String(editableRightNowFields?.to), 'MM-dd')}
            >
              <Sdometer
                value={format(String(editableRightNowFields?.to), 'HH:mm')}
              />
            </time>
          </div>
        ) : (
          <div className="max-h-full flex items-center justify-between gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
