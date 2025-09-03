import { format } from 'date-fns';
import { useState, useEffect, memo, useCallback } from 'react';
import { flow } from 'effect';

import { cn } from '@/lib/utils';
import { Sdometer } from '@/components/ui/sdometer';
import { setMinutesToDate } from '@/components/ui/timeline/utils';
import { editableRightNowCard } from '@/store/editableRightNowCard';

import type { CardProps } from './types';

export const Card = memo(
  ({
    fields,
    aimPosition,
    minCardSize = 2.5,
    convertToSpecificDisplayUnits,
    dateToDisplayUnits,
    displayUnitsToMinutes,
  }: CardProps) => {
    const selectedCardState = editableRightNowCard();

    const isSelected =
      selectedCardState.fields?.id === fields.id &&
      selectedCardState.isUnfreezed;

    const calcDisplayFields = useCallback(
      () => ({
        top: dateToDisplayUnits(fields.from),
        size: flow(
          () => [fields.from, fields.to].map(dateToDisplayUnits),
          ([from, to]) => to - from,
        )(),
      }),
      [fields, dateToDisplayUnits],
    );

    const [displayFields, setDisplayFields] = useState(calcDisplayFields);

    useEffect(() => setDisplayFields(calcDisplayFields), [calcDisplayFields]);

    useEffect(() => {
      if (isSelected) {
        setDisplayFields((prev) => ({
          top: editableRightNowCard.getState().isResizeMode
            ? Math.min(aimPosition, prev.top)
            : aimPosition,

          size: editableRightNowCard.getState().isResizeMode
            ? Math.max(aimPosition - prev.top, minCardSize)
            : prev.size,
        }));
      }
    }, [isSelected, aimPosition, minCardSize]);

    useEffect(() => {
      if (isSelected) {
        selectedCardState.setFields({
          ...fields,

          from: flow(
            displayUnitsToMinutes,
            setMinutesToDate(
              editableRightNowCard.getState().fields?.from as Date,
            ),
          )(displayFields.top),

          to: flow(
            displayUnitsToMinutes,
            setMinutesToDate(
              editableRightNowCard.getState().fields?.to as Date,
            ),
          )(displayFields.top + displayFields.size),
        });
      }
    }, [displayFields, fields, displayUnitsToMinutes, isSelected]);

    const onClick = () => {
      const aimEqFrom = dateToDisplayUnits(fields.from) === aimPosition;

      if (isSelected) {
        selectedCardState.toggle('isResizeMode');
        return;
      }

      selectedCardState.setFields(fields);
      selectedCardState.toggle('isUnfreezed', aimEqFrom);
    };

    return (
      <div
        role="button"
        className={cn(
          'absolute w-full bg-card transition-foo',
          isSelected &&
            'translate-y-0 translate-x-5 shadow-2xl bg-[tomato] z-1',
        )}
        onClick={onClick}
        tabIndex={0}
        style={{
          top: convertToSpecificDisplayUnits(displayFields.top),
          height: convertToSpecificDisplayUnits(displayFields.size),
        }}
      >
        <div
          className={cn(
            'sticky top-0 flex flex-col w-full min-h-[2.5lh] text-2xs select-none overflow-y-visible',
          )}
        >
          {isSelected && (
            <p className="absolute inset-0 flex w-full h-full justify-center items-center text-muted-foreground">
              {selectedCardState.isResizeMode ? 'TAPP' : 'TAP'}
            </p>
          )}
          {isSelected && (
            <div className="flex font-mono">
              <time
                className={cn(
                  !selectedCardState.isResizeMode && 'text-stands-out',
                  'inline-flex',
                )}
                dateTime={format(
                  String(selectedCardState.fields?.from),
                  'MM-dd',
                )}
              >
                <Sdometer
                  value={format(
                    String(selectedCardState.fields?.from),
                    'HH:mm',
                  )}
                />
              </time>
              {'-'}
              <time
                className={cn(
                  selectedCardState.isResizeMode && 'text-stands-out',
                  'inline-flex',
                )}
                dateTime={format(String(selectedCardState.fields?.to), 'MM-dd')}
              >
                <Sdometer
                  value={format(String(selectedCardState.fields?.to), 'HH:mm')}
                />
              </time>
            </div>
          )}

          {!isSelected && <p>{fields.sign}</p>}
        </div>
      </div>
    );
  },
);
