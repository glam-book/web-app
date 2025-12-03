import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import { format, getDate } from 'date-fns';
import { ru } from 'date-fns/locale';
import { flow, pipe } from 'effect';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import { Sdometer } from '@/components/ui/sdometer';
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
      sign: 'new +',
      from,
      to,
    });

    activeCardState.toggle('isResizeMode', true);
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

  useEffect(() => {
    let timerId = 0;

    const f = () => {
      if (!activeCardState.isUnfreezed && !isCardSelected) return;
      const newAimPosition = intersectionTimeIndex * sectionDisplaySize;
      setAimPosition(newAimPosition);
      aimPositionRef.current = newAimPosition;
    };

    timerId = requestAnimationFrame(f);

    return () => cancelAnimationFrame(timerId);
  }, [intersectionTimeIndex, isCardSelected, activeCardState]);

  return (
    <Comp
      className={cn(className, 'flex px-1')}
      onClick={ownerResult.isOwner ? onClick : undefined}
      {...props}
    >
      <div className="flex-1 flex flex-col border border-test">
        <h2 className="w-full bg-background">
          <time className="text-2xl uppercase">
            {format(currentDate, 'dd MMMM', { locale: ru })}
            {'  '}
          </time>
          <Sdometer
            className="text-2xl"
            value={format(
              pipe(
                aimPosition,
                displayUnitsToMinutes,
                setMinutesToDate(currentDate),
              ),
              'HH:mm',
            )}
          />
        </h2>

        <div className="absolute w-dvw z-1 bg-red inset-0 flex flex-col justify-center pointer-events-none">
          <div className="aim flex-1" />
          <div className="flex h-[2px] bg-red-500" />
          <div className="flex-1" />
        </div>

        <div className="flex-1 max-w-full overflow-y-hidden overflow-x-visible text-xl bg-white">
          <div
            ref={setScrollView}
            className={cn(
              'relative overflow-y-auto overflow-x-visible snap-mandatory snap-y max-h-full h-full snap-normal scroll-smooth isolate',
            )}
            onScrollEnd={() => {
              if (isCardSelected) {
                activeCardState.toggle('isUnfreezed', true);
              } else {
                const newAimPosition =
                  intersectionTimeIndex * sectionDisplaySize;
                setAimPosition(newAimPosition);
                aimPositionRef.current = newAimPosition;
              }
            }}
          >
            <div className="h-1/2 flex items-end bg-gray-100 overflow-y-hidden overflow-x-visible">
              <div className="flex-1">
                {timeList.map(time => (
                  <div key={time} className="flex">
                    <TimeLabel label={time} />
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 border-b border-dashed" />
                      <div className="flex-1" />
                    </div>
                  </div>
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

              <Container
                fields={cards}
                aimPosition={aimPosition}
                convertToSpecificDisplayUnits={toDisplayUnits}
                dateToDisplayUnits={dateToDisplayUnits}
                displayUnitsToMinutes={displayUnitsToMinutes}
                clickHandler={onTheCardClick}
              />
            </div>

            <div className="h-[50%] flex bg-gray-100 overflow-hidden">
              <div className="flex-1">
                {timeList.map((time, idx) => (
                  <div key={time} className="flex">
                    <TimeLabel
                      className={cn(
                        idx === 0 &&
                          'bg-[linear-gradient(180deg,var(--background),transparent)]',
                      )}
                      label={time}
                    />
                    <div className="flex-1 flex flex-col">
                      <div
                        className={cn(
                          'flex-1 border-b border-dashed',
                          idx === 0 && 'bg-background',
                        )}
                      />
                      <div className="flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Comp>
  );
};
