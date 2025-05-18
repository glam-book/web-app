import { useState, useMemo, useCallback } from 'react';
import {
  add,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  setSeconds,
  format,
} from 'date-fns';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';

import { CardsContainer } from './components/cardsContainer';
import { TimeLabel } from './components/timeLabel';
import {
  defaultSectionDisplaySize,
  defaultsSectionSizeInMinutes,
} from './constants';
import type { TimelineProps } from './types';
import {
  getTimeList,
  validateSectionSize,
  convertUnitsToMinutes,
  convertMinutesToUnits,
  getNumberOfSections,
} from './utils';
import { timeLine, dummy, timeLabel } from './style';

type Card = React.ComponentProps<typeof CardsContainer>['cards'][0] & {
  fromDate: Date;
  toDate: Date;
};

const toDisplayUnits = (n: number) => `${n}lh`;

export const Timeline = ({
  onCardChange,
  cards = [],
  sectionDisplaySize = defaultSectionDisplaySize,
  sectionSizeInMinutes = defaultsSectionSizeInMinutes,
  asChild = false,
  className,
  size,
  ...props
}: TimelineProps & VariantProps<typeof timeLine>) => {
  const Comp = asChild ? Slot : 'div';
  const [scrollView, setScrollView] = useState<HTMLDivElement | null>(null);
  const [intersectionTimeIndex, setIntersecionTimeIndex] = useState(0);
  const [aimPosition, setAimPosition] = useState(0);

  const validSectionSizeInMinutes = useMemo(
    () => validateSectionSize(sectionSizeInMinutes),
    [sectionSizeInMinutes],
  );

  const numberOfSections = useMemo(
    () => getNumberOfSections(validSectionSizeInMinutes),
    [validSectionSizeInMinutes],
  );

  const timeList = useMemo(
    () => getTimeList(numberOfSections, validSectionSizeInMinutes),
    [validSectionSizeInMinutes, numberOfSections],
  );

  const convertDateToDisplayUnits = useCallback(
    (date: Date) =>
      convertMinutesToUnits(
        numberOfSections,
        sectionDisplaySize,
        getHours(date) * 60 + getMinutes(date),
      ),
    [numberOfSections, sectionDisplaySize],
  );

  const convertDisplayUnitsToDate = useCallback(
    (units: number, sourceDate: Date) => {
      const minutes = convertUnitsToMinutes(
        numberOfSections,
        sectionDisplaySize,
        units,
      );

      return add(setHours(setMinutes(setSeconds(sourceDate, 0), 0), 0), {
        minutes,
      });
    },
    [numberOfSections, sectionDisplaySize],
  );

  const cardsForTheCardsContainer: Card[] = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        fromDate: card.from,
        toDate: card.to,
        from: convertDateToDisplayUnits(card.from),
        to: convertDateToDisplayUnits(card.to),
      })),
    [cards, convertDateToDisplayUnits],
  );

  const handleCardChange = useCallback(
    ({ from, to, fromDate, toDate, ...rest }: Card) => {
      onCardChange({
        ...rest,
        from: convertDisplayUnitsToDate(from, fromDate),
        to: convertDisplayUnitsToDate(to, toDate),
      });
    },
    [onCardChange, convertDisplayUnitsToDate],
  );

  const handleSelectCard = useCallback(
    ({ from }: Card) => {
      const lhPx = parseFloat(getComputedStyle(scrollView!).lineHeight);
      const top = lhPx * from;
      scrollView?.scroll(0, top);
    },
    [scrollView],
  );

  const onToggleResizeMode = useCallback(
    (isResizeMode: boolean, { from, to }: Card) => {
      const lhPx = parseFloat(getComputedStyle(scrollView!).lineHeight);
      const top = lhPx * (isResizeMode ? to : from);
      scrollView?.scroll(0, top);
    },
    [scrollView],
  );

  const intersectionObserverOpts = useMemo(
    () => ({
      root: scrollView,
      rootMargin: '-50% 0px -50% 0px',
      threshold: [0, 1],
    }),
    [scrollView],
  );

  return (
    <Comp
      className={cn(className, 'overflow-y-hidden relative text-2xs isolate')}
      {...props}
    >
      <div className="absolute inset-0 flex flex-col justify-center">
        <div className="flex-1 border-b border-black border-dashed" />
        <div className="flex-1" />
      </div>

      <div
        ref={setScrollView}
        className={cn(
          'pl-2 relative overflow-y-auto snap-mandatory snap-y overflow-x-hidden max-h-full h-full snap-normal overscroll-auto scroll-smooth',
        )}
        onScrollEnd={() => {
          setAimPosition(intersectionTimeIndex * sectionDisplaySize);

          // if (currentItem) {
          //   console.log({ aimPositionLh, currentSizeLh });

          //   setParamsCurrent((prev) => ({
          //     ...prev,
          //     posLh: aimPositionLh < prev.posLh ? aimPositionLh : prev.posLh,
          //     sizeLh: Math.max(
          //       aimPositionLh - currentPosLh,
          //       sectionDisplaySize,
          //     ),
          //   }));

          //   setParamsCurrent(({ posLh, sizeLh, diffPosLh }) => {
          //     const newDiffPosLh = posLh - newPosLh;
          //     const newSizeLh = Math.max(sizeLh + newDiffPosLh, 2.5);
          //     console.log({ newDiffPosLh, diffPosLh, newSizeLh, sizeLh });

          //     return {
          //       posLh: newPosLh,
          //       sizeLh: newSizeLh,
          //       diffPosLh: newDiffPosLh,
          //     };
          //   });
          // }
        }}
      >
        <div className="h-[50%] flex items-end gap-1 bg-sky-50 overflow-hidden">
          <div>
            {timeList.map((time) => (
              <TimeLabel key={time} label={time} />
            ))}
            <div className={cn(dummy({ size }))}></div>
          </div>
        </div>

        <div className="flex-1 flex gap-1">
          <div
            className={cn(
              timeLabel({ size }),
              '[&>*:first-child]:-translate-y-2/4',
            )}
          >
            {timeList.map((time, idx) => (
              <TimeLabel
                key={time}
                label={time}
                isIntersecting={idx === intersectionTimeIndex}
              />
            ))}
          </div>

          <div className="relative flex-1 flex flex-col">
            {timeList.map((time, idx) => (
              <IntersectionTarget
                key={time}
                intersectionOpts={intersectionObserverOpts}
                callback={({ isIntersecting }) => {
                  if (isIntersecting) {
                    setIntersecionTimeIndex(idx);
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

            <CardsContainer
              cards={cardsForTheCardsContainer}
              aimPosition={aimPosition}
              onChange={handleCardChange}
              toDisplayUnits={toDisplayUnits}
              onSelect={handleSelectCard}
              onToggleResizeMode={onToggleResizeMode}
            />

            {/*cards.map((item, index) => (
              <Card
                key={item.id}
                sign={item.sign}
                topPositionLh={currentPosLh}
                toUnitsForDisplay={(n) => `${n}lh`}
                className="transition-foo absolute"
                sizeLh={currentSizeLh}
                state={index === currentItemId && TimelineCardState.selected}
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
            ))*/}
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
