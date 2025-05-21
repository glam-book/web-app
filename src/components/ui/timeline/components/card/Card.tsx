import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { flow } from 'effect';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  getMinutesFromDate,
  setMinutesToDate,
} from '@/components/ui/timeline/utils';

import type { CardProps } from './types';
import { checkIsCardChanged } from './utils';

export const Card = memo(
  ({
    fields,
    aimPosition,
    minCardSize = 2.5,
    convertToSpecificDisplayUnits,
    minutesToDisplayUnits,
    displayUnitsToMinutes,
    onChange,
    onSelectCard,
    onBlurCard,
    onToggleResizeMode,
  }: CardProps) => {
    const [isResizeMode, setResizeMode] = useState(false);
    const wasClickedOnTheCard = useRef(false);
    const [isSelected, setSelected] = useState(false);

    const dateToDisplayUnits = useMemo(
      () => flow(getMinutesFromDate, minutesToDisplayUnits),
      [minutesToDisplayUnits],
    );

    const [localFields, setLocalFields] = useState<
      typeof fields & { size: number; top: number }
    >({
      ...fields,
      top: dateToDisplayUnits(fields.from),
      size: flow(
        () => [fields.from, fields.to].map(dateToDisplayUnits),
        ([from, to]) => to - from,
      )(),
    });

    useEffect(() => {
      setLocalFields({
        ...fields,
        top: dateToDisplayUnits(fields.from),
        size: flow(
          () => [fields.from, fields.to].map(dateToDisplayUnits),
          ([from, to]) => to - from,
        )(),
      });
    }, [fields, dateToDisplayUnits]);

    useEffect(() => {
      const handler = () => {
        if (!wasClickedOnTheCard.current) {
          setSelected(false);
        }

        wasClickedOnTheCard.current = false;
      };

      document.addEventListener('click', handler);

      return () => document.removeEventListener('click', handler);
    }, []);

    useEffect(() => {
      if (isSelected) {
        setLocalFields((prev) => {
          const top = isResizeMode
            ? Math.min(aimPosition, prev.top)
            : aimPosition;

          const size = isResizeMode
            ? Math.max(aimPosition - prev.top, minCardSize)
            : prev.size;

          const from = flow(
            displayUnitsToMinutes,
            setMinutesToDate(prev.from),
          )(top);

          const to = flow(
            displayUnitsToMinutes,
            setMinutesToDate(prev.to),
          )(top + size);

          return {
            ...prev,
            top,
            size,
            from,
            to,
          };
        });
      }
    }, [
      isSelected,
      aimPosition,
      minCardSize,
      isResizeMode,
      dateToDisplayUnits,
      displayUnitsToMinutes,
      setLocalFields,
    ]);

    useEffect(() => {
      console.log({ localFields });
    }, [localFields]);

    useEffect(() => {
      if (!isSelected && checkIsCardChanged(fields, localFields)) {
        console.log('on hcnage call?');
        onChange({
          id: localFields.id,
          sign: localFields.sign,

          from: flow(
            displayUnitsToMinutes,
            setMinutesToDate(localFields.from),
          )(localFields.top),

          to: flow(
            displayUnitsToMinutes,
            setMinutesToDate(localFields.to),
          )(localFields.top + localFields.size),
        });
        onBlurCard?.(localFields);
        setResizeMode(false);
      }
    }, [isSelected, onBlurCard, onChange, localFields, fields]);

    const onClick = () => {
      wasClickedOnTheCard.current = true;
      setSelected(true);

      if (!isSelected) {
        onSelectCard?.(localFields);
        setResizeMode(false);
      }
    };

    return (
      <div
        role="button"
        className="absolute w-full bg-[tomato] transition-foo"
        onClick={onClick}
        tabIndex={0}
        style={{
          top: convertToSpecificDisplayUnits(localFields.top),
          height: convertToSpecificDisplayUnits(localFields.size),
        }}
      >
        <div
          className={cn(
            'sticky top-0 w-full min-h-[2.5lh] text-2xs select-none overflow-y-visible',
            isSelected && 'top-[1lh]',
          )}
        >
          <div className="absolute w-full flex items-center -translate-y-full bg-lime-50">
            {isSelected && (
              <>
                toggle resize mode:::
                <Switch
                  checked={isResizeMode}
                  onCheckedChange={(checked) => {
                    setResizeMode(checked);
                    onToggleResizeMode(checked, localFields);
                  }}
                />
              </>
            )}
          </div>
          {localFields.sign}
        </div>
      </div>
    );
  },
);
