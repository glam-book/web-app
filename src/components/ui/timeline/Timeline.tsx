import { useState } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';
import { Dnd } from '@/components/ui/dnd';
import { IntersectionObserverViewport } from '@/components/ui/intersectionObserverViewport';

export type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

export const Timeline = ({
  className,
  asChild = false,
  children,
  ...props
}: TimelineProps) => {
  const Comp = asChild ? Slot : 'div';
  const [currentItem, setCurrentItem] = useState<HTMLElement>();
  const [intersectionTime, setIntersecionTime] = useState('');
  const divisions = 96;

  const getTimeByIndex = (idx: number) => {
    const mm = `${String((idx * 15) % 60).padStart(2, '0')}`;
    const hh = `${String(Math.floor(idx / 4)).padStart(2, '0')}`;
    const time = `${hh}:${mm}`;

    return time;
  };

  const timeList = Array.from({ length: divisions }, (_, idx) =>
    getTimeByIndex(idx)
  );

  const onMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const wrapper = target.parentElement;
    const wrapperRect = wrapper?.getBoundingClientRect();
    const cardPositionPercent =
      parseFloat(window.getComputedStyle(target).top) /
      (wrapperRect?.height ?? 0);
    setIntersecionTime(
      getTimeByIndex(Math.round(divisions * cardPositionPercent))
    );
  };

  return (
    <Comp className={cn(className, 'flex gap-1 pb-[50vw]')} {...props}>
      <div>
        {timeList.map((time) => (
          <time
            key={time}
            className={cn(
              'h-[2.5lh] flex flex-col text-2xs translate-y-[-0.5lh]',
              !time.endsWith('00') && 'text-transparent',
              intersectionTime === time && 'text-[pink] scale-110'
            )}
            dateTime={time}
          >
            {time}
          </time>
        ))}
      </div>

      <IntersectionObserverViewport
        className="flex-1 flex flex-col relative"
        callback={console.log}
        options={{
          rootMargin: '0px',
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.9, 1],
        }}
        target={currentItem}
      >
        {Array.from({ length: timeList.length }, (_, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col border-t border-dashed"
          ></div>
        ))}
        <Dnd
          onStart={(e) => setCurrentItem(e.currentTarget)}
          onMove={onMove}
          validatePositionY={(y) => Math.max(y, 0)}
          className="bg-[tomato] top-4 left-4 fixed"
        >
          {children}
        </Dnd>
      </IntersectionObserverViewport>
    </Comp>
  );
};
