import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import { format, getDate } from 'date-fns';
import { ru } from 'date-fns/locale';
import { flow, pipe } from 'effect';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import { activeCard } from '@/components/ui/timeline/store';
import { cn } from '@/lib/utils';
import { owner, records } from '@/shrekServices';
import type { MapValueType } from '@/types';
import { between } from '@/utils';

import { Container } from './components/container';
import { TimeLabel } from './components/timeLabel';
import {
  defaultSectionDisplaySize,
  defaultsSectionSizeInMinutes,
} from './constants';
import { dummy, timeLine } from './style';
import type { TimelineProps } from './types';
import {
  convertMinutesToUnits,
  convertUnitsToMinutes,
  getMinutesFromDate,
  getNumberOfSections,
  getTimeList,
  setMinutesToDate,
  validateSectionSize,
} from './utils';

type CardFields = MapValueType<
  React.ComponentProps<typeof Container>['fields']
>;

const toDisplayUnits = (n: number) => `${n}lh`;

export const Timeline = ({
  currentDate = new Date(),
  cards = new Map(),
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
  const aimPositionRef = useRef(aimPosition);
  const selectedCardState = records.store.editableRightNow();
  const activeCardState = activeCard();
  const isCardSelected = Boolean(selectedCardState.fields);
  const ownerResult = owner.useIsOwner();

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

  const dateToDisplayUnits = useCallback(
    (epoch: Date) => {
      const minutes =
        getMinutesFromDate(epoch) +
        (getDate(epoch) !== getDate(currentDate) ? 24 * 60 : 0);

      return convertMinutesToUnits(
        numberOfSections,
        sectionDisplaySize,
        minutes,
      );
    },
    [numberOfSections, sectionDisplaySize, currentDate],
  );

  const displayUnitsToMinutes = useCallback(
    (units: number) =>
      convertUnitsToMinutes(numberOfSections, sectionDisplaySize, units),
    [numberOfSections, sectionDisplaySize],
  );

  const scrollToDate = useCallback(
    (date: Date) => {
      if (!scrollView) return;
      const position = dateToDisplayUnits(date);
      const lhPx = parseFloat(getComputedStyle(scrollView).lineHeight);
      const y = lhPx * position;
      scrollView.scroll(0, y);
    },
    [scrollView, dateToDisplayUnits],
  );

  const scrollToCard = useCallback(
    flow(({ from, to }: CardFields, isResizeMode?: boolean) => {
      if (getDate(to) !== getDate(from)) return from;
      return isResizeMode ? to : from;
    }, scrollToDate),
    [scrollToDate],
  );

  const cardsList = useMemo(() => {
    if (!cards || (cards instanceof Map && cards.size === 0)) return [];
    const values =
      cards instanceof Map
        ? Array.from(cards.values())
        : Array.isArray(cards)
          ? cards
          : [];
    return values
      .filter((f): f is CardFields => Boolean(f?.from))
      .sort(
        (a, b) =>
          (a.from instanceof Date ? a.from.getTime() : new Date(a.from).getTime()) -
          (b.from instanceof Date ? b.from.getTime() : new Date(b.from).getTime()),
      );
  }, [cards]);

  const currentTimeMs = useMemo(() => {
    const date = pipe(
      aimPosition,
      displayUnitsToMinutes,
      setMinutesToDate(currentDate),
    );
    return date.getTime();
  }, [aimPosition, displayUnitsToMinutes, currentDate]);

  const { nextCardAbove, nextCardBelow } = useMemo(() => {
    const above = [...cardsList]
      .filter(f => {
        const t = f.from instanceof Date ? f.from.getTime() : new Date(f.from).getTime();
        return t < currentTimeMs;
      })
      .pop();
    const below = cardsList.find(f => {
      const t = f.from instanceof Date ? f.from.getTime() : new Date(f.from).getTime();
      return t > currentTimeMs;
    });
    return { nextCardAbove: above ?? null, nextCardBelow: below ?? null };
  }, [cardsList, currentTimeMs]);

  const goToCardAbove = useCallback(() => {
    if (!nextCardAbove?.from) return;
    const date =
      nextCardAbove.from instanceof Date
        ? nextCardAbove.from
        : new Date(nextCardAbove.from);
    scrollToDate(date);
  }, [nextCardAbove, scrollToDate]);

  const goToCardBelow = useCallback(() => {
    if (!nextCardBelow?.from) return;
    const date =
      nextCardBelow.from instanceof Date
        ? nextCardBelow.from
        : new Date(nextCardBelow.from);
    scrollToDate(date);
  }, [nextCardBelow, scrollToDate]);

  useEffect(() => {
    const fields = records.store.editableRightNow.getState().fields;

    if (isCardSelected) {
      scrollToCard(fields!, activeCardState.isResizeMode);
    }
  }, [
    isCardSelected,
    activeCardState.isResizeMode,
    selectedCardState.fields?.id,
    scrollToCard,
  ]);

  // const hasScrolledToNearestRef = useRef(false);

  // useEffect(() => {
  //   if (hasScrolledToNearestRef.current) return;
  //   if (!scrollView) return;
  //   if (isCardSelected) return;
  //   if (!cards || (cards instanceof Map && cards.size === 0)) return;

  //   const values = cards instanceof Map ?
  //     Array.from(cards.values()) :
  //     Array.isArray(cards) ?
  //       cards : [];

  //   if (values.length === 0) return;

  //   let nearest = null;
  //   let minDiff = Infinity;
  //   const now = currentDate ? currentDate.getTime() : Date.now();

  //   for (const f of values) {
  //     if (!f || !f.from) continue;
  //     const d = f.from instanceof Date ? f.from.getTime() : new Date(f.from).getTime();
  //     const diff = Math.abs(d - now);
  //     if (diff < minDiff) {
  //       minDiff = diff;
  //       nearest = f;
  //     }
  //   }

  //   if (nearest && nearest.from) {
  //     const date = nearest.from instanceof Date ? nearest.from : new Date(nearest.from);
  //     scrollToDate(date);
  //     hasScrolledToNearestRef.current = true;
  //   }
  // }, [scrollView, cards, currentDate, isCardSelected, scrollToDate]);

  const createNewCard = () => {
    const from = pipe(
      aimPosition,
      displayUnitsToMinutes,
      setMinutesToDate(currentDate),
    );

    const to = pipe(
      aimPosition + sectionDisplaySize,
      displayUnitsToMinutes,
      setMinutesToDate(currentDate),
    );

    records.startEdit({
      from,
      to,
    });

    activeCardState.toggle('isResizeMode', true);
    activeCardState.toggle('isUnfreezed', true);
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const targetIsACard = (e.target as HTMLElement).closest('[role="button"]');

    if (targetIsACard) {
      return;
    }

    if (isCardSelected) {
      records.finishEdit();
      return;
    }

    createNewCard();
  };

  const onTheCardClick = useCallback(
    (fields: CardFields) => {
      const isThatCardSelected =
        fields.id === records.store.editableRightNow.getState().fields?.id;

      activeCardState.toggle('isUnfreezed', false);

      if (isThatCardSelected) {
        activeCardState.toggle('isResizeMode');
        return;
      }

      records.startEdit(fields);

      const from = dateToDisplayUnits(fields.from);

      const dontNeedScrollToTheCard = between(
        aimPositionRef.current,
        from - sectionDisplaySize,
        from + sectionDisplaySize,
        { strict: true },
      );

      activeCardState.toggle('isUnfreezed', dontNeedScrollToTheCard);
    },
    [dateToDisplayUnits],
  );

  const intersectionObserverOpts = useMemo(
    () => ({
      root: scrollView,
      rootMargin: '-50% 0px -50% 0px',
      threshold: [0, 0.1, 0.2, 0.3, 1],
    }),
    [scrollView],
  );

  // useEffect(() => {
  //   let timerId = 0;

  //   const f = () => {
  //     if (!activeCardState.isUnfreezed && !isCardSelected) return;
  //     const newAimPosition = intersectionTimeIndex * sectionDisplaySize;
  //     setAimPosition(newAimPosition);
  //     aimPositionRef.current = newAimPosition;
  //   };

  //   timerId = requestAnimationFrame(f);

  //   return () => cancelAnimationFrame(timerId);
  // }, [intersectionTimeIndex, isCardSelected, activeCardState]);

  return (
    <Comp
      className={cn(className, 'relative content-grid overflow-y-auto')}
      onClick={ownerResult.isOwner ? onClick : undefined}
      {...props}
    >
      <div className="card-header backdrop-blur-none shadow-shadow">
        <h2 className="flex justify-between pr-3 indent-3">
          <time className="text-xl uppercase">
            {format(currentDate, 'dd MMMM', { locale: ru })}
          </time>
        </h2>
      </div>

      <div className="full-bleed relative flex flex-col overflow-y-auto">
        <div className="absolute w-dvw z-1 inset-0 flex flex-col justify-center pointer-events-none">
          <div className="aim flex-1" />
          <div className="flex h-[2px] bg-red-500" />
          <div className="flex-1" />
        </div>

        <div className="relative flex-1 max-w-full overflow-y-hidden overflow-x-visible text-xl">
          <div
            ref={setScrollView}
            className={cn(
              'relative overflow-y-auto overflow-x-hidden snap-mandatory snap-y max-h-full h-full snap-normal scroll-smooth',
            )}
            onScroll={() => {
              activeCardState.toggle('isUnfreezed', false);
            }}
            onScrollEnd={() => {
              const newAimPosition = intersectionTimeIndex * sectionDisplaySize;
              setAimPosition(newAimPosition);
              aimPositionRef.current = newAimPosition;
              if (isCardSelected) activeCardState.toggle('isUnfreezed', true);
            }}
          >
            <div className="content-grid text-base h-1/2">
              <div className="text-xl card bg-none bg-background-light pl-0 border-b-0 rounded-none shadow-none flex items-end overflow-y-hidden overflow-x-visible">
                <div className="flex-1">
                  {timeList.map(time => (
                    <div key={time} className="flex">
                      <TimeLabel
                        className="[&>*]:-translate-y-1/2"
                        label={time}
                      />
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 border-b border-dashed" />
                        <div className="flex-1" />
                      </div>
                    </div>
                  ))}
                  <div className={cn(dummy({ size }))} />
                </div>
              </div>
            </div>

            <div className="flex-1 content-grid text-base relative">
              <div className="text-xl card pl-0 bg-none bg-background border-t-0 rounded-none shadow-none">
                {timeList.map((time, idx) => (
                  <div
                    key={time}
                    className={cn(
                      'flex snap-center basis-full',
                      idx === 0 && 'basis-1/2 snap-end',
                    )}
                  >
                    <TimeLabel
                      label={time}
                      isIntersecting={idx === intersectionTimeIndex}
                      className={cn(
                        '[&>*]:-translate-y-1/2',
                        idx === 0 && `-translate-y-2/4 h-[1.25lh]`,
                      )}
                    />

                    <IntersectionTarget
                      intersectionOpts={intersectionObserverOpts}
                      callback={entry => {
                        if (entry.isIntersecting) {
                          setIntersecionTimeIndex(idx);
                        }
                      }}
                      className={cn('flex-1 flex flex-col w-full')}
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
                  </div>
                ))}

                <div className="content-grid">
                  <Container
                    fields={cards}
                    aimPosition={aimPosition}
                    convertToSpecificDisplayUnits={toDisplayUnits}
                    dateToDisplayUnits={dateToDisplayUnits}
                    displayUnitsToMinutes={displayUnitsToMinutes}
                    clickHandler={onTheCardClick}
                  />
                </div>
              </div>
            </div>

            <div className="h-1/2 content-grid text-base">
              <div className="text-xl card pl-0 rounded-none bg-none bg-background flex overflow-hidden">
                <div className="flex-1">
                  {timeList.map(time => (
                    <div key={time} className="flex">
                      <TimeLabel
                        className="[&>*]:-translate-y-1/2"
                        label={time}
                      />
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 border-b border-dashed" />
                        <div className="flex-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-lh text-2xl py-2 rounded-b-4xl bg-background-darker" />

      {cardsList.length > 0 && (
        <div
          className="absolute bottom-6 right-4 z-10 flex flex-col gap-2 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-11 w-11 rounded-full shadow-lg"
            aria-label="К следующей карточке сверху"
            disabled={!nextCardAbove}
            onClick={goToCardAbove}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-11 w-11 rounded-full shadow-lg"
            aria-label="К следующей карточке снизу"
            disabled={!nextCardBelow}
            onClick={goToCardBelow}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      )}
    </Comp>
  );
};
