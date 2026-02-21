import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import { format, getDate } from 'date-fns';
import { ru } from 'date-fns/locale';
import { flow, pipe } from 'effect';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { owner, records } from '@/shrekServices';
import type { MapValueType } from '@/types';
import { Button } from '@/components/ui/button';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import { activeCard } from '@/components/ui/timeline/store';

import { Container } from './components/container';
import { TimeLabel } from './components/timeLabel';
import { defaultsSectionSizeInMinutes as sectionSizeInMinutes } from './constants';
import { timeLineVariants } from './style';
import type { TimelineProps } from './types';
import {
  getMinutesFromDate,
  getNumberOfSections,
  getTimeList,
  setMinutesToDate,
} from './utils';

type CardFields = MapValueType<
  React.ComponentProps<typeof Container>['fields']
>;

const toDisplayUnits = (n: number) => `${n * 100}%`;

export const Timeline = ({
  currentDate = new Date(),
  cards = new Map(),
  asChild = false,
  className,
  size = 'sm',
  ...props
}: TimelineProps & VariantProps<typeof timeLineVariants>) => {
  const Comp = asChild ? Slot : 'div';

  const [scrollView, setScrollView] = useState<HTMLDivElement | null>(null);
  const [todayRecordPlace, setTodayRecordPlace] =
    useState<HTMLDivElement | null>(null);
  const [intersectionTimeIndex, setIntersecionTimeIndex] = useState(0);
  const [aimPosition, setAimPosition] = useState(0);
  const aimPositionRef = useRef(aimPosition);
  const selectedCardState = records.store.editableRightNow();
  const activeCardState = activeCard();
  const isCardSelected = Boolean(selectedCardState.fields);
  const ownerResult = owner.useIsOwner();

  const numberOfSections = getNumberOfSections(sectionSizeInMinutes);
  const timeList = getTimeList(numberOfSections, sectionSizeInMinutes);
  const sectionSizeInPercent = 1 / numberOfSections;
  const sectionDisplaySize = sectionSizeInPercent;

  const dateToDisplayUnits = useCallback(
    (epoch: Date) => {
      const minutes =
        getMinutesFromDate(epoch) +
        // Это нужно если мы вылезаем на следующий день?
        (getDate(epoch) !== getDate(currentDate) ? 24 * 60 : 0);

      return minutes / (24 * 60);
    },
    [currentDate],
  );

  const displayUnitsToMinutes = useCallback(
    (units: number) => units * 24 * 60,
    [],
  );

  const scrollToDate = useCallback(
    (date: Date) => {
      if (!scrollView) return;
      if (!todayRecordPlace) return;
      const position = dateToDisplayUnits(date);
      const inPixels = todayRecordPlace.clientHeight;
      const y = position * inPixels;
      scrollView.scroll(0, y);
    },
    [scrollView, dateToDisplayUnits],
  );

  const [lastScrollTarget, setLastScrollTarget] = useState<number | undefined>(
    undefined,
  );

  const scrollToCard = useCallback(
    flow(({ from, to }: { from: Date; to: Date }, isResizeMode?: boolean) => {
      if (getDate(to) !== getDate(from)) return from;
      const scrollTargetDate = isResizeMode ? to : from;

      setLastScrollTarget(
        (dateToDisplayUnits(scrollTargetDate) * 24 * 60) / 30,
      );

      return scrollTargetDate;
    }, scrollToDate),
    [scrollToDate],
  );

  const cardsList = useMemo(() => {
    return Array.from(cards.values())
      .filter((f): f is CardFields => Boolean(f?.from))
      .sort((a, b) => a.from.getTime() - b.from.getTime());
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
        const t = f.from.getTime();
        return t < currentTimeMs;
      })
      .pop();

    const below = cardsList.find(f => {
      const t = f.from.getTime();
      return t > currentTimeMs;
    });

    return { nextCardAbove: above ?? null, nextCardBelow: below ?? null };
  }, [cardsList, currentTimeMs]);

  const goToCardAbove = useCallback(() => {
    if (!nextCardAbove?.from) return;
    scrollToDate(nextCardAbove.from);
  }, [nextCardAbove, scrollToDate]);

  const goToCardBelow = useCallback(() => {
    if (!nextCardBelow?.from) return;
    scrollToDate(nextCardBelow.from);
  }, [nextCardBelow, scrollToDate]);

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
    scrollToCard({ from, to }, true);
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
  };

  const onTheCardClick = useCallback(
    (fields: CardFields) => {
      const isThatCardSelected =
        fields.id === records.store.editableRightNow.getState().fields?.id;

      activeCardState.toggle('isUnfreezed', false);

      if (isThatCardSelected) {
        activeCardState.toggle('isResizeMode');
        scrollToCard(fields, activeCard.getState().isResizeMode);

        return;
      }

      records.startEdit(fields);

      scrollToCard(fields);
    },
    [dateToDisplayUnits],
  );

  useEffect(() => {
    if (
      lastScrollTarget !== undefined &&
      lastScrollTarget !== Math.floor(lastScrollTarget) &&
      Math.abs(intersectionTimeIndex - lastScrollTarget) <= 1
    ) {
      setLastScrollTarget(undefined);
      activeCardState.toggle('isUnfreezed', true);
      return;
    }

    if (
      lastScrollTarget !== undefined &&
      intersectionTimeIndex - lastScrollTarget === 0
    ) {
      setLastScrollTarget(undefined);
      activeCardState.toggle('isUnfreezed', true);
      return;
    }

    if (
      lastScrollTarget !== undefined &&
      intersectionTimeIndex !== lastScrollTarget &&
      selectedCardState.fields
    ) {
      scrollToCard(selectedCardState.fields, activeCardState.isResizeMode);
      return;
    }

    activeCardState.toggle(
      'isUnfreezed',
      lastScrollTarget === undefined && isCardSelected,
    );
  }, [selectedCardState, isCardSelected, aimPosition, lastScrollTarget]);

  const intersectionObserverOpts = useMemo(
    () => ({
      root: scrollView,
      rootMargin: '-50% 0px -50% 0px',
      threshold: [0, 0.1, 0.2, 0.3, 1],
    }),
    [scrollView],
  );

  const [isScrolling, setIsScrolling] = useState(false);

  const addNewRecordButton = useRef<HTMLButtonElement>(null);

  return (
    <Comp
      className={cn(className, 'relative content-grid overflow-y-auto hide')}
      onClick={ownerResult.isOwner ? onClick : undefined}
      {...props}
    >
      <div className="breakout card-header backdrop-blur-none shadow-shadow">
        <h2 className="flex justify-between pr-3 indent-3">
          <time className="text-xl uppercase">
            {format(currentDate, 'd MMMM, EEEE', { locale: ru })}
          </time>
        </h2>
      </div>

      <div className="full-bleed relative flex flex-col overflow-y-auto">
        {isCardSelected && (
          <div className="absolute w-dvw z-1 inset-0 flex flex-col justify-center pointer-events-none">
            <div className="aim flex-1" />
            <div className="flex h-[2px] bg-red-500" />
            <div className="flex-1" />
          </div>
        )}

        {!isScrolling && ownerResult.isOwner && (
          <Button
            ref={addNewRecordButton}
            fashion="fancy"
            aria-label="add new record"
            size="icon"
            className={cn(
              'absolute left-[6ch] top-[calc(50%-0.5lh)] -translate-y-1/2 z-1 size-[1.4lh] rounded-full bg-success-deep border border-highlight bouncein',
              isCardSelected && 'hidden',
            )}
            onClick={createNewCard}
          >
            <Plus />
          </Button>
        )}

        <div className="relative flex-1 max-w-full overflow-y-hidden overflow-x-visible text-xl">
          <div
            ref={setScrollView}
            className={cn(
              'relative overflow-y-auto scrollbar-hidden overflow-x-hidden snap-mandatory snap-y max-h-full h-full snap-normal scroll-smooth',
            )}
            onScroll={() => {
              setIsScrolling(true);
              activeCardState.toggle('isUnfreezed', false);
            }}
            onScrollEnd={() => {
              setIsScrolling(false);
              const newAimPosition =
                intersectionTimeIndex * sectionSizeInPercent;
              setAimPosition(newAimPosition);
              aimPositionRef.current = newAimPosition;
            }}
          >
            <div className="content-grid text-base h-1/2">
              <div className="breakout card bg-none bg-background-light pl-0 border-b-0 rounded-none shadow-none flex items-end overflow-y-hidden overflow-x-visible">
                <div className="flex-1">
                  {timeList.map(time => (
                    <div key={time} className="flex gap-2">
                      <TimeLabel
                        className={cn(
                          '[&>*]:-translate-y-1/1 text-muted-foreground',
                          timeLineVariants({ size }),
                        )}
                        label={time}
                      />
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 border-t border-dashed" />
                        <div className="flex-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={setTodayRecordPlace}
              className="flex-1 bg-transparent content-grid text-base"
            >
              <div className="breakout relative text-xl card pl-0 bg-none bg-background border-t-0 rounded-none shadow-none">
                {timeList.map((time, idx) => (
                  <div key={time} className="relative flex basis-full gap-2">
                    <TimeLabel
                      label={time}
                      isIntersecting={
                        isCardSelected &&
                        ((selectedCardState.fields?.from &&
                          format(selectedCardState.fields.from, 'HH:mm') ===
                            time) ||
                          (selectedCardState.fields?.to &&
                            format(selectedCardState.fields.to, 'HH:mm') ===
                              time))
                      }
                      className={cn(
                        '[&>*]:-translate-y-1/1',
                        timeLineVariants({ size }),
                      )}
                    />

                    <IntersectionTarget
                      intersectionOpts={intersectionObserverOpts}
                      callback={entry => {
                        if (entry.isIntersecting) {
                          setIntersecionTimeIndex(idx);
                        }
                      }}
                      className="flex-1 flex flex-col w-full"
                    >
                      <div className="h-[1px] w-full snap-center"></div>
                      <div className="w-full flex-1 border-t"></div>
                      <div className="w-full flex-1"></div>
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
                    minCardSize={sectionDisplaySize}
                  />
                </div>
              </div>
            </div>

            <div className="h-1/2 content-grid text-base">
              <div className="breakout text-xl card pl-0 rounded-none bg-none bg-background flex overflow-hidden">
                <div className="flex-1">
                  {timeList.map(time => (
                    <div key={time} className="flex gap-2">
                      <TimeLabel
                        className={cn(
                          '[&>*]:-translate-y-1/1 [&>*:first-child]:absolute text-muted-foreground',
                          timeLineVariants({ size }),
                        )}
                        label={time}
                      />
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 border-t border-dashed"></div>
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

      <div
        className="breakout absolute bottom-20 -right-(--gap) -translate-x-1/6 z-10 flex flex-col gap-2"
        onClick={e => e.stopPropagation()}
      >
        <Button
          type="button"
          size="icon"
          fashion="glassy"
          className="size-10 border-t-foreground/10 border-l border-l-foreground/10 text-muted-foreground"
          aria-label="К следующей карточке сверху"
          disabled={!nextCardAbove}
          onClick={goToCardAbove}
        >
          <ChevronUp className="size-7" />
        </Button>
        <Button
          type="button"
          size="icon"
          fashion="glassy"
          className="size-10 border-t-foreground/10 border-l border-l-foreground/10 text-muted-foreground"
          aria-label="К следующей карточке снизу"
          disabled={!nextCardBelow}
          onClick={goToCardBelow}
        >
          <ChevronDown className="size-7" />
        </Button>
      </div>
    </Comp>
  );
};
