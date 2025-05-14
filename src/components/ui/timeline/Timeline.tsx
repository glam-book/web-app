import { useState, useEffect, useRef, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import { curry } from '@/utils';

import { Card } from './components/card';
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
  convertDateToUnits,
  getNumberOfSections,
} from './utils';

const toDisplayUnits = (n: number) => `${n}lh`;

export const Timeline = ({
  onChange,
  asChild = false,
  cards = [],
  sectionDisplaySize = defaultSectionDisplaySize,
  sectionSizeInMinutes = defaultsSectionSizeInMinutes,
  className,
  ...props
}: TimelineProps) => {
  const Comp = asChild ? Slot : 'div';
  const compRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [currentItem, setCurrentItem] = useState<HTMLElement>();
  const [currentItemId, setCurrentItemId] = useState<number>();
  const [intersectionTimeIndex, setIntersecionTimeIndex] = useState(0);
  const wasClickOnCard = useRef(false);
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

  const curriedConvertDateToUnits = useMemo(
    () => curry(convertDateToUnits)(numberOfSections)(sectionDisplaySize),
    [numberOfSections, sectionDisplaySize],
  );

  const [{ posLh: currentPosLh, sizeLh: currentSizeLh }, setParamsCurrent] =
    useState<{ posLh: number; sizeLh: number; diffPosLh: number }>({
      posLh: 10,
      sizeLh: 15,
      diffPosLh: 0,
    });

  const cardsForTheCardsContainer: React.ComponentProps<
    typeof CardsContainer
  >['cards'] = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        from: curriedConvertDateToUnits(card.from),
        to: curriedConvertDateToUnits(card.to),
      })),
    [cards, curriedConvertDateToUnits],
  );

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
        if (!wasClickOnCard.current) {
          setCurrentItem(undefined);
          setCurrentItemId(undefined);
          return;
        }

        wasClickOnCard.current = false;
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-center">
        <div className="flex-1 border-b border-black border-dashed" />
        <div className="flex-1" />
      </div>

      <div
        className={cn(
          'pl-2 relative overflow-y-auto snap-mandatory snap-y overflow-x-hidden max-h-full h-full snap-normal overscroll-auto',
        )}
        ref={compRef}
        onScrollEnd={() => {
          setAimPosition(intersectionTimeIndex * sectionDisplaySize);

          if (currentItem) {
            console.log({ aimPositionLh, currentSizeLh });

            setParamsCurrent((prev) => ({
              ...prev,
              posLh: aimPositionLh < prev.posLh ? aimPositionLh : prev.posLh,
              sizeLh: Math.max(
                aimPositionLh - currentPosLh,
                sectionDisplaySize,
              ),
            }));

            // setParamsCurrent(({ posLh, sizeLh, diffPosLh }) => {
            //   const newDiffPosLh = posLh - newPosLh;
            //   const newSizeLh = Math.max(sizeLh + newDiffPosLh, 2.5);
            //   console.log({ newDiffPosLh, diffPosLh, newSizeLh, sizeLh });

            //   return {
            //     posLh: newPosLh,
            //     sizeLh: newSizeLh,
            //     diffPosLh: newDiffPosLh,
            //   };
            // });
          }
        }}
      >
        <div className="h-[50%] flex items-end gap-1 bg-sky-50 overflow-hidden">
          <div>
            <>
              {timeList.map((time) => (
                <TimeLabel key={time} label={time} />
              ))}
              <div className={`h-[${sectionDisplaySize}lh]`}></div>
            </>
          </div>
        </div>

        <div className="flex-1 flex gap-1">
          <div
            className={`[&>*:first-child]:h-[${sectionDisplaySize / 2}lh] [&>*:first-child]:-translate-y-2/4`}
          >
            {timeList.map((time, idx) => (
              <TimeLabel
                key={time}
                label={time}
                isIntersecting={idx === intersectionTimeIndex}
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
              onChange={console.log}
              toDisplayUnits={toDisplayUnits}
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
