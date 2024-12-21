import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';
// import { isEndOfScroll } from '@/utils';
import { Button } from '@/components/ui/button';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';
// import { useSetEventListener } from '@/hooks';
// import { IntersectionObserverViewport } from '@/components/ui/intersectionObserverViewport';
import { TimeLabel } from './timeLabel';

export type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  cards?: React.ReactNode[];
};

export const Timeline = ({
  className,
  asChild = false,
  cards = [],
  ...props
}: TimelineProps) => {
  const Comp = asChild ? Slot : 'div';
  const compRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [currentItem, setCurrentItem] = useState<HTMLElement>();
  const [currentItemId, setCurrentItemId] = useState<number>();
  const [intersectionTime, setIntersecionTime] = useState('');
  const [isResizible, setIsResizible] = useState(false);
  const divisions = 96;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  const testRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!(testRef.current && compRef.current)) return;
    const target = testRef.current;
    const root = compRef.current;
    const opts = {
      root,
      rootMargin: '-50% 0px 0px 0px',
      threshold: [0, 1],
    };
    const callback = console.log;
    const obs = new IntersectionObserver(callback, opts);
    obs.observe(target);
    console.log({ target, root });

    return () => {
      obs.unobserve(target);
    };
  }, [testRef, compRef]);

  const getTimeByIndex = (idx: number) => {
    const mm = `${String((idx * 15) % 60).padStart(2, '0')}`;
    const hh = `${String(Math.floor(idx / 4)).padStart(2, '0')}`;
    const time = `${hh}:${mm}`;
    return time;
  };

  const timeList = Array.from({ length: divisions }, (_, idx) =>
    getTimeByIndex(idx),
  );

  const getIndexByTime = (time: string) => timeList.indexOf(time);

  const scrollHandler = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (!currentItem) return;
    setCurrentIntersectionTime(e.currentTarget, currentItem);
  };

  const setCurrentIntersectionTime = (
    container: HTMLElement,
    aim: HTMLElement,
  ) => {
    const containerRect = container.getBoundingClientRect();
    const aimRect = aim.getBoundingClientRect();
    const aimY =
      aimRect.y -
      containerRect.y -
      containerRect.height / 2 +
      container.scrollTop;
    const aimYPercent = aimY / (container.scrollHeight - containerRect.height);
    const time = getTimeByIndex(Math.round(divisions * aimYPercent));
    console.log(time);
    setIntersecionTime(time);
  };

  const [opts, setOpts] = useState({});

  useEffect(() => {
    setOpts({
      root: compRef.current,
      rootMargin: '-50% 0px -50% 0px',
      threshold: [0, 1],
    });
  }, [compRef]);

  // useSetEventListener(compRef.current, 'scroll', (e) => {
  //   const wrapperRect = wrapperRef.current?.getBoundingClientRect();
  //   const aim =
  //     document.documentElement.clientHeight / 2 - (wrapperRect?.top ?? 0);
  //   const aimPercent = aim / (wrapperRect?.height ?? 0);
  // });

  return (
    <Comp className={cn(className, 'overflow-hidden relative text-2xs')} {...props}>
      <div className="absolute inset-0 flex flex-col justify-center">
        <div className="h-[1px] translate-y-[calc(-2.5lh/2)] border-b border-black border-dashed"></div>
      </div>

      <div
        className={cn(
          'pl-2 relative overflow-y-auto snap-mandatory snap-y overflow-x-hidden max-h-full h-full',
          currentItem && 'overscroll-none',
        )}
        onScroll={scrollHandler}
        ref={compRef}
      >
        <div className="h-[50%] bg-sky-50"></div>

        <div
          // ref={testRef}
          className={cn('flex-1 flex gap-1')}
        >
          <div>
            {timeList.map((time) => (
              <IntersectionTarget
                key={time}
                intersectionOpts={opts}
                callback={(entry) => {
                  if (entry.isIntersecting) {
                    setIntersecionTime(time);
                  }
                }}
              >
                <TimeLabel
                  label={time}
                  isIntersecting={time === intersectionTime}
                  className={cn(
                    intersectionTime !== timeList.at(0) && 'snap-center',
                  )}
                />
              </IntersectionTarget>
            ))}
          </div>

          <div
            ref={cardsContainerRef}
            className="relative flex-1 flex flex-col"
          >
            {timeList.map((time) => (
              <div key={time} className="flex-1 flex flex-col w-full border-b border-dashed"></div>
            ))}

            <div className="bg-green-200 absolute top-[200px] w-full h-[20lh] text-2xs select-none transition-all">
              card= 0
            </div>

            {cards.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'bg-[tomato] absolute top-[30lh] w-full h-[2.5lh] text-2xs select-none overflow-y-visible',
                  currentItemId === index && 'sticky',
                )}
                onContextMenu={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget;
                  if (currentItem) {
                    setCurrentItem(undefined);
                    setCurrentItemId(undefined);
                    // const yPercent =
                    //   y / (cardsContainerRef.current?.clientHeight ?? 0);
                    // const qDivisions = Math.round(divisions * yPercent);
                    // const time = getTimeByIndex(qDivisions);
                    // console.log(time);

                    const timeIndex = getIndexByTime(intersectionTime);
                    const roundedY =
                      ((cardsContainerRef.current?.clientHeight ?? 0) /
                        divisions) *
                      timeIndex;

                    target.style.top = `${roundedY}px`;
                  } else {
                    target.scrollIntoView({
                      block: 'center',
                      behavior: 'smooth',
                    });
                    // setCurrentItem(target);
                    // const timer = window.setInterval(() => {
                    //   window.clearInterval(timer);
                    //   setCurrentItemId(index);
                    //   const compRect = compRef.current?.getBoundingClientRect();
                    //   const targetRect = target.getBoundingClientRect();
                    //   const y = targetRect.top - (compRect?.top ?? 0);
                    //   target.style.top = `${y}px`;
                    // }, 100);
                  }
                }}
              >
                <div className="h-[10lh] bg-[tomato]">{item}</div>
              </div>
            ))}
          </div>

          {/*<IntersectionObserverViewport
          ref={wrapperRef}
          className="flex-1 relative"
          callback={console.log}
          target={currentItem}
          options={{
            rootMargin: '0px',
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.9, 1],
          }}
        >
          {Array.from({ length: timeList.length }, (_, idx) => (
            <div key={idx} className="h-[2.5lh] border-t border-dashed"></div>
          ))}
          {cards?.map((card, idx) => (
            <div
              key={idx}
              onContextMenu={(e) => {
                e.preventDefault();
                console.log('contextmenu');
                // document.documentElement.style.paddingBottom = '100vh';
                const target = e.currentTarget;
                setCurrentItem(target);
                setCurrentItemId(idx);
                const rect = target.getBoundingClientRect();
                document.documentElement.scrollBy({
                  top: rect.top - document.documentElement.clientHeight / 2,
                  behavior: 'smooth',
                });
                window.requestAnimationFrame(() => {
                  target.style.top = `${document.documentElement.clientHeight / 2}px`;
                  // target.style.translate = `max(calc(50vw - 40ch / 2 + 3rem), 5ch) 0`;
                });
              }}
              className={cn(
                'bg-[tomato] absolute top-4 w-full h-[5lh] text-2xs select-none transition-all',
                currentItemId === idx && 'fixed translate-x-[5ch] z-10',
                // currentItemId === idx && isResizible && 'resize-y',
              )}
            >
              {card}
            </div>
          ))}
        </IntersectionObserverViewport>*/}
        </div>

        <div className="h-[50%] bg-sky-50"></div>

        {currentItem && false && (
          <footer className="fixed bottom-0 left-0 w-full z-10 flex items-center justify-around bg-accent">
            <p>Fooooooter</p>
            <Button
              size="sm"
              onClick={() => {
                setCurrentItem(undefined);
                setCurrentItemId(undefined);
                setIntersecionTime('');
                const wrapperRect = wrapperRef.current?.getBoundingClientRect();
                const rect = currentItem.getBoundingClientRect();
                const y = rect.top - (wrapperRect?.top ?? 0);
                console.log(
                  Math.round((y / (wrapperRect?.height ?? 0)) * divisions),
                );
                const yy =
                  (Math.round(y / ((wrapperRect?.height ?? 0) / divisions)) *
                    (wrapperRect?.height ?? 0)) /
                  divisions;
                console.log(y / ((wrapperRect?.height ?? 0) / divisions));
                console.log(yy);
                console.log(y);
                currentItem.style.top = `${yy}px`;

                window.requestAnimationFrame(() => {
                  currentItem.style.translate = '';
                  document.documentElement.style.paddingBottom = '';
                });
              }}
            >
              Click me
            </Button>
            <Button size="sm" onClick={() => setIsResizible(true)}>
              Resize
            </Button>
          </footer>
        )}
      </div>
    </Comp>
  );
};
