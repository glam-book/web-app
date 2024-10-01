import { useState, useEffect, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IntersectionObserverViewport } from '@/components/ui/intersectionObserverViewport';

export type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  cards?: React.ReactNode[];
};

export const Timeline = ({
  className,
  asChild = false,
  cards,
  ...props
}: TimelineProps) => {
  const Comp = asChild ? Slot : 'div';
  const [currentItem, setCurrentItem] = useState<HTMLElement>();
  const [currentItemId, setCurrentItemId] = useState<number>();
  const [intersectionTime, setIntersecionTime] = useState('');
  const divisions = 96;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getTimeByIndex = (idx: number) => {
    const mm = `${String((idx * 15) % 60).padStart(2, '0')}`;
    const hh = `${String(Math.floor(idx / 4)).padStart(2, '0')}`;
    const time = `${hh}:${mm}`;

    return time;
  };

  const timeList = Array.from({ length: divisions }, (_, idx) =>
    getTimeByIndex(idx)
  );

  // const onMove = (event: React.TouchEvent<HTMLDivElement>) => {
  //   const target = event.currentTarget;
  //   const wrapper = target.parentElement;
  //   const wrapperRect = wrapper?.getBoundingClientRect();
  //   const cardPositionPercent =
  //     parseFloat(window.getComputedStyle(target).top) /
  //     (wrapperRect?.height ?? 0);
  //   setIntersecionTime(
  //     getTimeByIndex(Math.round(divisions * cardPositionPercent))
  //   );
  // };

  useEffect(() => {
    const clickOutsideHandler = () => {
      console.log('click outside');
    };

    document.body.addEventListener('click', clickOutsideHandler);

    return () =>
      document.body.removeEventListener('click', clickOutsideHandler);
  }, []);

  useEffect(() => {
    const scrollHandler = () => {
      if (!currentItem) return;

      const wrapperRect = wrapperRef.current?.getBoundingClientRect();
      const aim =
        document.documentElement.clientHeight / 2 - (wrapperRect?.top ?? 0);
      const aimPercent = aim / (wrapperRect?.height ?? 0);
      setIntersecionTime(getTimeByIndex(Math.round(divisions * aimPercent)));
    };

    document.addEventListener('scroll', scrollHandler);

    return () => document.removeEventListener('scroll', scrollHandler);
  }, [currentItem]);

  return (
    <Comp className={cn(className, 'flex gap-1')} {...props}>
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
        ref={wrapperRef}
        className="flex-1 flex flex-col relative"
        // callback={console.log}
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
        {cards?.map((card, idx) => (
          <div
            key={idx}
            onContextMenu={(e) => {
              e.preventDefault();
              console.log('contextmenu');
              document.documentElement.style.paddingBottom = '100vh';
              const target = e.currentTarget;
              setCurrentItem(target);
              setCurrentItemId(idx);
              const rect = target.getBoundingClientRect();
              target.style.userSelect = 'none';
              document.documentElement.scrollBy({
                top: rect.top - document.documentElement.clientHeight / 2,
                behavior: 'smooth',
              });
              window.requestAnimationFrame(() => {
                target.style.position = 'fixed';
                target.style.top = '50%';
                target.style.translate =
                  'max(calc(50vw - 40ch / 2 + 3rem), 5ch) 0';
              });
            }}
            className={cn(
              'bg-[tomato] absolute top-96 left-4 w-full h-[5lh] text-2xs',
              currentItemId === idx && 'translate-x-[5ch]'
            )}
          >
            {card}
          </div>
        ))}
      </IntersectionObserverViewport>

      {currentItem && (
        <footer className="fixed bottom-0 left-0 w-full z-10 flex items-center justify-around bg-accent">
          <p>Fooooooter</p>
          <Button
            size="sm"
            onClick={() => {
              setCurrentItem(undefined);
              setCurrentItemId(undefined);
              setIntersecionTime('');
              window.getSelection()?.empty();
              currentItem.style.userSelect = '';
              const wrapperRect = wrapperRef.current?.getBoundingClientRect();
              const rect = currentItem.getBoundingClientRect();
              const y = rect.top - (wrapperRect?.top ?? 0);
              console.log(
                Math.round((y / (wrapperRect?.height ?? 0)) * divisions)
              );
              const yy =
                Math.round(y / ((wrapperRect?.height ?? 0) / divisions)) *
                (wrapperRect?.height ?? 0) / divisions;
              console.log(y / ((wrapperRect?.height ?? 0) / divisions))
              console.log(yy);
              console.log(y);
              currentItem.style.top = `${yy}px`;

              window.requestAnimationFrame(() => {
                currentItem.style.position = '';
                currentItem.style.translate = '';
                document.documentElement.style.paddingBottom = '';
              });
            }}
          >
            Click me
          </Button>
        </footer>
      )}
    </Comp>
  );
};
