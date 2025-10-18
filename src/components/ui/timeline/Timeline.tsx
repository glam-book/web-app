import { useState, useEffect, useMemo, useCallback } from 'react';
import { pipe, flow } from 'effect';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import type { MapValueType } from '@/types';
import { records } from '@/shrekServices';
import { activeCard } from '@/components/ui/timeline/store';

import { Container } from './components/container';
import { TimeLabel } from './components/timeLabel';
import {
  defaultSectionDisplaySize,
  defaultsSectionSizeInMinutes,
} from './constants';
import type { TimelineProps } from './types';
import {
  getTimeList,
  validateSectionSize,
  convertMinutesToUnits,
  convertUnitsToMinutes,
  getNumberOfSections,
  getMinutesFromDate,
  setMinutesToDate,
} from './utils';
import { timeLine, dummy } from './style';

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
  const selectedCardState = records.store.editableRightNow();
  const activeCardState = activeCard();
  const isCardSelected = Boolean(selectedCardState.fields);

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
    (date: Date) => {
      const minutes = getMinutesFromDate(date);

      return convertMinutesToUnits(
        numberOfSections,
        sectionDisplaySize,
        minutes,
      );
    },
    [numberOfSections, sectionDisplaySize],
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
      scrollView?.scroll(0, y);
    },
    [scrollView, dateToDisplayUnits],
  );

  const scrollToCard = useCallback(
    flow(
      ({ from, to }: CardFields, isResizeMode?: boolean) =>
        isResizeMode ? to : from,
      scrollToDate,
    ),
    [scrollToDate],
  );

  useEffect(() => {
    const fields = records.store.editableRightNow.getState().fields;

    if (isCardSelected) {
      scrollToCard(fields!, Boolean(activeCardState.isResizeMode));
    }
  }, [
    isCardSelected,
    activeCardState.isResizeMode,
    selectedCardState.fields?.id,
    scrollToCard,
  ]);

  const createNewCard = () => {
    records.startEdit({
      sign: 'new +',

      from: pipe(
        aimPosition,
        displayUnitsToMinutes,
        setMinutesToDate(currentDate),
      ),

      to: pipe(
        aimPosition + sectionDisplaySize,
        displayUnitsToMinutes,
        setMinutesToDate(currentDate),
      ),
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

  const onTheCardClick = (fields: CardFields) => {
    const isThatCardSelected = fields.id === selectedCardState.fields?.id;

    if (isThatCardSelected) {
      activeCardState.toggle('isResizeMode');
      return;
    }

    records.finishEdit();
    records.startEdit(fields);

    const aimEqFrom = dateToDisplayUnits(fields.from) === aimPosition;
    activeCardState.toggle('isUnfreezed', aimEqFrom);
  };

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
      className={cn(
        className,
        'overflow-y-hidden relative text-xl isolate bg-white',
      )}
      onClick={onClick}
      {...props}
    >
      <div className="absolute inset-0 flex flex-col justify-center">
        <div className="aim flex-1 border-b" />
        <div className="flex h-[2px] bg-[red]"></div>
        <div className="flex-1" />
      </div>

      <div
        ref={setScrollView}
        className={cn(
          'relative overflow-y-auto snap-mandatory snap-y overflow-x-hidden max-h-full h-full snap-normal overscroll-auto scroll-smooth',
        )}
        onScrollEnd={_e => {
          const newAimPosition = intersectionTimeIndex * sectionDisplaySize;
          setAimPosition(newAimPosition);
          console.log({ newAimPosition });
          if (isCardSelected) {
            activeCardState.toggle('isUnfreezed', true);
          }
        }}
      >
        <div className="h-[50%] flex items-end bg-sky-50 overflow-hidden">
          <div>
            {timeList.map(time => (
              <TimeLabel key={time} label={time} />
            ))}
            <div className={cn(dummy({ size }))} />
          </div>
        </div>

        <div className={cn('flex-1 flex flex-col relative')}>
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
                className={cn(idx === 0 && `-translate-y-2/4 h-[1.25lh]`)}
              />

              <IntersectionTarget
                intersectionOpts={intersectionObserverOpts}
                callback={({ isIntersecting }) => {
                  if (isIntersecting) {
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

          <Container
            fields={cards}
            aimPosition={aimPosition}
            convertToSpecificDisplayUnits={toDisplayUnits}
            dateToDisplayUnits={dateToDisplayUnits}
            displayUnitsToMinutes={displayUnitsToMinutes}
            clickHandler={onTheCardClick}
          />
        </div>

        <div className="h-[50%] flex bg-sky-50 overflow-hidden">
          <div>
            {timeList.map(time => (
              <TimeLabel key={time} label={time} />
            ))}
          </div>
        </div>
      </div>
    </Comp>
  );
};
