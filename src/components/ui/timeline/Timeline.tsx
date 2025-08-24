import { useState, useEffect, useMemo, useCallback } from 'react';
import { flow } from 'effect';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { tap } from '@/utils';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import type { MapValueType } from '@/types';

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
  convertMinutesToUnits,
  convertUnitsToMinutes,
  getNumberOfSections,
  getMinutesFromDate,
  setMinutesToDate,
} from './utils';
import { timeLine, dummy, timeLabel } from './style';
import { editableRightNowCard } from './store';

type CardFields = MapValueType<
  React.ComponentProps<typeof CardsContainer>['fields']
>;

const toDisplayUnits = (n: number) => `${n}lh`;

export const Timeline = ({
  onCardChange,
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
  const selectedCardState = editableRightNowCard();
  const isCardSelected = Boolean(selectedCardState.fields);

  // const [isCardSelected, setIsCardSelected] = useState(false);

  // const aimPosition = useMemo(
  //   () => intersectionTimeIndex * sectionDisplaySize,
  //   [intersectionTimeIndex],
  // );

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

  // const minutesToDisplayUnits = useCallback(
  //   (minutes: number) =>
  //     convertMinutesToUnits(numberOfSections, sectionDisplaySize, minutes),
  //   [numberOfSections, sectionDisplaySize],
  // );

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
      const position = dateToDisplayUnits(date);
      const lhPx = parseFloat(getComputedStyle(scrollView!).lineHeight);
      const y = lhPx * position;
      scrollView?.scroll(0, y);
    },
    [scrollView, dateToDisplayUnits],
  );

  const scrollToCard = useCallback(
    flow(
      ({ from, to }: CardFields, isResizeMode?: boolean) =>
        isResizeMode ? to : from,
      tap(scrollToDate),
    ),
    [scrollToDate],
  );

  useEffect(() => {
    selectedCardState.toggle('isUnfreezed', false);
  }, [isCardSelected, selectedCardState.isResizeMode]);

  useEffect(() => {
    const fields = editableRightNowCard.getState().fields;

    if (isCardSelected && fields) {
      scrollToCard(fields, Boolean(selectedCardState.isResizeMode));
    }
  }, [isCardSelected, selectedCardState.isResizeMode, scrollToCard]);

  const [tmpFields, setTmpFields] = useState<CardFields>();
  //
  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((e.target as HTMLElement).closest('[role="button"]')) return;

    if (selectedCardState.fields) {
      onCardChange(selectedCardState.fields);
      selectedCardState.reset();
      setTmpFields(undefined);
      return;
    }

    console.log('add new card');
    const fields: CardFields = {
      id: 0,
      sign: 'new +',
      from: setMinutesToDate(new Date())(displayUnitsToMinutes(aimPosition)),
      to: setMinutesToDate(new Date())(
        displayUnitsToMinutes(aimPosition + sectionDisplaySize),
      ),
    };

    setTmpFields(fields);
    selectedCardState.setFields(fields);
  };

  // const [selectedCardId, setSelectedCardId] = useState<number>();
  // const [isFreezed, setFreezed] = useState(true);
  // const [isResizeMode, setResizeMode] = useState(false);
  // const [tmpFields, setTmpFields] = useState<CardFields>();

  // const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  //   const maybeCardElement = (e.target as HTMLElement).closest<HTMLElement>(
  //     '[data-hate-react-id]',
  //   );

  //   const cardId = Number(maybeCardElement?.dataset.hateReactId) || undefined;
  //   console.log({ cardId });

  //   setSelectedCardId(cardId);
  //   // setFreezed(true);

  //   if (!maybeCardElement && !selectedCardId) {
  //     console.debug('click outside card');
  //     setTmpFields({
  //       id: 52,
  //       from: setMinutesToDate(new Date())(displayUnitsToMinutes(aimPosition)),
  //       to: setMinutesToDate(new Date())(
  //         displayUnitsToMinutes(aimPosition + sectionDisplaySize),
  //       ),
  //       sign: 'new +',
  //     });
  //     setSelectedCardId(52);
  //     setFreezed(false);
  //   }

  //   if (maybeCardElement && !selectedCardId) {
  //     const card = cards.get(cardId!);
  //     scrollToCard(card!);
  //     console.log({ card });
  //     // flow(scrollToCard, dateToDisplayUnits, setAimPositionForCards, () =>

  //     //   setSelectedCardId(
  //     //     Number(maybeCardElement?.dataset.hateReactId) || undefined,
  //     //   ),
  //     // );
  //   }

  //   if (maybeCardElement && selectedCardId) {
  //     console.log('is resize select');
  //     setFreezed(true);
  //     setResizeMode((prev) => {
  //       const card = cards.get(cardId!);
  //       scrollToCard(card!, !prev);
  //       return !prev;
  //     });
  //   }
  // };

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
      onClick={onClick}
      {...props}
    >
      <div className="absolute inset-0 flex flex-col justify-center">
        <div className="aim flex-1 border-b" />
        <div className="flex h-[2px] bg-[tomato]"></div>
        <div className="flex-1" />
      </div>

      <div
        ref={setScrollView}
        className={cn(
          'pl-2 relative overflow-y-auto snap-mandatory snap-y overflow-x-hidden max-h-full h-full snap-normal overscroll-auto scroll-smooth',
        )}
        onScrollEnd={(_e) => {
          const newAimPosition = intersectionTimeIndex * sectionDisplaySize;
          setAimPosition(newAimPosition);
          // setFreezed(selectedCardId === undefined);
          if (isCardSelected) {
            selectedCardState.toggle('isUnfreezed', true);
          }
          // console.log('end of scroll');
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
              fields={cards}
              aimPosition={aimPosition}
              onChange={onCardChange}
              convertToSpecificDisplayUnits={toDisplayUnits}
              dateToDisplayUnits={dateToDisplayUnits}
              displayUnitsToMinutes={displayUnitsToMinutes}
              // onSelectCard={onSelectCard}
              // onBlurCard={() => setIsCardSelected(false)}
              // onToggleResizeMode={onSelectCard}
              // selectedId={selectedCardId}
              // isFreezed={isFreezed}
              tmpFields={tmpFields}
              // isResizeMode={isResizeMode}
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
