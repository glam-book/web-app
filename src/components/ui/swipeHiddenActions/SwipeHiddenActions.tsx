import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';

type SwipeHiddenActions = React.HTMLAttributes<HTMLDivElement> & {
  dummySlot: React.ReactNode;
  actionSlot: React.ReactNode;
  onAction: () => void;
};

export const SwipeHiddenActions = ({
  dummySlot,
  actionSlot,
  onAction,
  className,
  ...rest
}: SwipeHiddenActions) => {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  const conf = useMemo(() => ({
    root,
  }), [root]);

  return (
    <div
      ref={setRoot}
      className={cn(
        'absolute inset-0 overflow-y-scroll snap-mandatory snap-x isolate',
        className,
      )}
      {...rest}
    >
      <div className="flex">
        {dummySlot}

        <IntersectionTarget
          intersectionOpts={conf}
          callback={({ isIntersecting }) => {
            if (isIntersecting) {
              console.log('intersect!');
              onAction();
            }
          }}
        >
          {actionSlot}
        </IntersectionTarget>
      </div>
    </div>
  );
};
