import { useState, useEffect, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import { TimeLabel } from './timeLabel';
import { TimelineCard } from '@/components/ui/timelineCard';

import { foo } from './hooks/foo';

type Card = {
  startTime: Date;
  endTime: Date;
  sign: string;
  id: number;
};

type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  cards?: Array<Card>;
  setCards?: (cards: Array<Card>) => void;
};

export const Timeline = ({
  className,
  asChild = false,
  cards = [],
  setCards,
  ...props
}: TimelineProps) => {
  const Comp = asChild ? Slot : 'div';
  const compRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [currentItem, setCurrentItem] = useState<HTMLElement>();
  const [currentItemId, setCurrentItemId] = useState<number>();
  const [intersectionTime, setIntersecionTime] = useState('');
  const divisions = 96;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wasClickOnCard = useRef(false);
  const [resizeYValueLh, setResizeYValueLh] = useState(0);

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

  const timeToLh = (time: string) => getIndexByTime(time) * 2.5;

  const [a, aa] = useState(10);

  useEffect(() => {
    if (currentItem) {
      aa(timeToLh(intersectionTime));
    }
  }, [currentItem, intersectionTime, timeToLh]);

  const [opts, setOpts] = useState({});

  useEffect(() => {
    setOpts({
      root: compRef.current,
      rootMargin: '-50% 0px -50% 0px',
      threshold: [0, 1],
    });
  }, [compRef]);

  return (
    <Comp
      className={cn(className, 'overflow-y-hidden relative text-2xs isolate')}
      {...props}
      onClick={(e) => {
        console.log('click');
        if (!wasClickOnCard.current) {
          setCurrentItem(undefined);
          setCurrentItemId(undefined);
          return;
        }
        wasClickOnCard.current = false;
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-center">
        <div className="flex-1 border-b border-black border-dashed"></div>
        <div className="flex-1">
          <div className="pl-2 flex gap-1 h-full">
            <TimeLabel className="invisible" label="00:00" />
            {/*<div
              className="border-dashed rounded bg-[lime] w-full max-h-full self-start"
              style={{ height: `min(100%, ${Math.max(resizeYValueLh + 2.5, 2.5)}lh)` }}
            >
              Record: 1
            </div>*/}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'pl-2 relative overflow-y-auto snap-mandatory snap-y overflow-x-hidden max-h-full h-full snap-normal overscroll-auto',
          // currentItem && 'overscroll-none',
        )}
        ref={compRef}
        onScroll={(e) => {
          // if (e.currentTarget.scrollTop <= 0) {
          //   document.querySelector('main')?.scrollTo({
          //     behavior: 'smooth',
          //     top: 0,
          //   });
          // }
        }}
      >
        <div className="h-[50%] flex items-end gap-1 bg-sky-50 overflow-hidden">
          <div>
            <>
              {timeList.map((time) => (
                <TimeLabel key={time} label={time} />
              ))}
              <div className="h-[1.25lh]"></div>
            </>
          </div>
        </div>

        <div className="flex-1 flex gap-1">
          <div className="[&>*:first-child]:h-[1.25lh] [&>*:first-child]:-translate-y-2/4">
            {timeList.map((time) => (
              <TimeLabel
                key={time}
                label={time}
                isIntersecting={time === intersectionTime}
              />
            ))}
          </div>

          <div
            ref={cardsContainerRef}
            className="relative flex-1 flex flex-col"
          >
            {timeList.map((time, idx) => (
              <IntersectionTarget
                key={time}
                intersectionOpts={opts}
                callback={({ isIntersecting }) => {
                  if (isIntersecting) {
                    setIntersecionTime(time);
                    // window.navigator.vibrate(1);
                  }
                }}
                className={cn(
                  'flex-1 basis-full flex flex-col w-full snap-center',
                  idx === 0 && 'basis-1/2 snap-end',
                )}
              >
                {idx === 0 && (
                  <div className="w-full flex-1 border-t border-dashed"></div>
                )}
                {idx !== 0 && (
                  <>
                    <div className="w-full flex-1 border-b border-dashed"></div>
                    <div className="w-full flex-1"></div>
                  </>
                )}
              </IntersectionTarget>
            ))}

            {cards.map((item, index) => (
              <TimelineCard
                key={item.id}
                sign={item.sign}
                topPositionLh={a}
                sizeLh={10}
                onClick={(e) => {
                  wasClickOnCard.current = true;
                  const target = e.currentTarget;
                  if (currentItem) {
                    // setCurrentItem(undefined);
                    // setCurrentItemId(undefined);
                    // const yPercent =
                    //   y / (cardsContainerRef.current?.clientHeight ?? 0);
                    // const qDivisions = Math.round(divisions * yPercent);
                    // const time = getTimeByIndex(qDivisions);
                    // console.log(time);
                    // const timeIndex = getIndexByTime(intersectionTime);
                    // const roundedY =
                    //   ((cardsContainerRef.current?.clientHeight ?? 0) /
                    //     divisions) *
                    //   timeIndex;
                    // target.style.top = `${roundedY}px`;
                  } else {
                    target.scrollIntoView({
                      block: 'center',
                      behavior: 'smooth',
                    });
                    setCurrentItem(target);
                    setCurrentItemId(index);
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
              />
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

        <div className="h-[50%] flex gap-1 bg-sky-50 overflow-hidden">
          <div>
            {timeList.map((time) => (
              <TimeLabel key={time} label={time} />
            ))}
          </div>
        </div>
      </div>
    </Comp>
  );
};
