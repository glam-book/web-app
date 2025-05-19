import debounce from 'debounce';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  add,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  setSeconds,
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

type Card = React.ComponentProps<typeof CardsContainer>['cards'][0];

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
        dateFrom: card.from,
        dateTo: card.to,
        from: convertDateToDisplayUnits(card.from),
        to: convertDateToDisplayUnits(card.to),
      })),
    [cards, convertDateToDisplayUnits],
  );

  useEffect(() => {
    console.dir({ cardsForTheCardsContainer });
  }, [cardsForTheCardsContainer]);

  const handleCardChange = useCallback(
    ({ from, to, dateTo, dateFrom, ...rest }: Card) => {
      onCardChange({
        ...rest,
        from: convertDisplayUnitsToDate(from, dateFrom),
        to: convertDisplayUnitsToDate(to, dateTo),
      });
    },
    [onCardChange, convertDisplayUnitsToDate],
  );

  const scrollTo = useCallback(
    (position: number) => {
      const lhPx = parseFloat(getComputedStyle(scrollView!).lineHeight);
      const y = lhPx * position;
      console.log({ y });
      scrollView?.scroll(0, y);
    },
    [scrollView],
  );

  const handleSelectCard = useCallback(
    ({ from }: Card) => {
      console.log('select card handler');
      scrollTo(from);
    },
    [scrollTo],
  );

  const onToggleResizeMode = useCallback(
    (isResizeMode: boolean, { from, to }: Card) => {
      console.info('toggle resize mode:::', from, to);
      scrollTo(isResizeMode ? to : from);
    },
    [scrollTo],
  );

  const intersectionObserverOpts = useMemo(
    () => ({
      root: scrollView,
      rootMargin: '-50% 0px -50% 0px',
      threshold: [0, 1],
    }),
    [scrollView],
  );

  const debouncedSetAimPosition = useMemo(
    () => debounce(setAimPosition, 133),
    [],
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
          // console.log({ intersectionTimeIndex });
          // setAimPosition(intersectionTimeIndex * sectionDisplaySize);
        }}
        onScroll={() => {
          debouncedSetAimPosition(intersectionTimeIndex * sectionDisplaySize);
        }}
      >
        <div className="h-[50%] flex items-end gap-1 bg-sky-50 overflow-hidden">
          <div>
            {timeList.map((time) => (
              <TimeLabel key={time} label={time} />
            ))}
            <div className={cn(dummy({ size }))} />
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
          </div>
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
