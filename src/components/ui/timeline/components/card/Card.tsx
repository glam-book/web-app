import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { flow } from 'effect';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { setMinutesToDate } from '@/components/ui/timeline/utils';

import type { CardProps } from './types';
import { checkIsCardChanged } from './utils';

export const Card = memo(
  ({
    fields,
    aimPosition,
    isSelected,
    minCardSize = 2.5,
    convertToSpecificDisplayUnits,
    dateToDisplayUnits,
    displayUnitsToMinutes,
    onChange,
    onSelectCard,
    onBlurCard,
    onToggleResizeMode,
  }: CardProps) => {
    const [isResizeMode, setResizeMode] = useState(false);
    const wasClickedOnTheCard = useRef(false);
    // const [isSelected, setSelected] = useState(false);
    const [localFields, setLocalFields] = useState(fields);

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

    useEffect(() => {
      setDisplayFields(calcDisplayFields);
    }, [calcDisplayFields]);

    useEffect(() => {
      setLocalFields((prev) => ({
        ...prev,

        // sign: fields.sign,

        from: flow(
          displayUnitsToMinutes,
          setMinutesToDate(prev.from),
        )(displayFields.top),

        to: flow(
          displayUnitsToMinutes,
          setMinutesToDate(prev.to),
        )(displayFields.top + displayFields.size),
      }));
    }, [displayFields, fields, displayUnitsToMinutes]);

    useEffect(() => {
      console.log(aimPosition, 'from the card:::', displayFields, isSelected);
    }, [aimPosition]);

    const handleResetCardSelect = useCallback(() => {
      const isCardChanged = checkIsCardChanged(fields, localFields);

      console.log('on hcnage call?', { isCardChanged });

      if (isCardChanged) onChange(localFields);
      // onBlurCard?.(localFields);
      setResizeMode(false);
    }, [localFields, fields, onBlurCard, onChange]);

    useEffect(() => {
      if (!isSelected) {
        console.log('call on change:::', { isSelected });
        handleResetCardSelect();
      }
    }, [isSelected, handleResetCardSelect]);

    // useEffect(() => {
    //   const handler = () => {
    //     if (!wasClickedOnTheCard.current) {
    //       // setSelected(false);
    //       handleResetCardSelect();
    //     }

    //     wasClickedOnTheCard.current = false;
    //   };

    //   // document.addEventListener('click', handler);

    //   return () => document.removeEventListener('click', handler);
    // }, [handleResetCardSelect]);

    useEffect(() => {
      if (isSelected) {
        setDisplayFields((prev) => ({
          top: isResizeMode ? Math.min(aimPosition, prev.top) : aimPosition,

          size: isResizeMode
            ? Math.max(aimPosition - prev.top, minCardSize)
            : prev.size,
        }));
      }
    }, [isSelected, aimPosition, minCardSize, isResizeMode]);

    const onClick = () => {
      wasClickedOnTheCard.current = true;

      // setSelected(true);

      if (!isSelected) {
        onSelectCard?.(localFields);
        setResizeMode(false);
      }
    };

    return (
      <div
        role="button"
        className="absolute w-full bg-[tomato] transition-foo"
        // onClick={onClick}
        tabIndex={0}
        data-hate-react-id={fields.id}
        style={{
          top: convertToSpecificDisplayUnits(displayFields.top),
          height: convertToSpecificDisplayUnits(displayFields.size),
        }}
      >
        <div
          className={cn(
            'sticky top-0 w-full min-h-[2.5lh] text-2xs select-none overflow-y-visible',
            isSelected && 'top-[1lh]',
          )}
        >
          {/*
 <div className="absolute w-full flex items-center -translate-y-full bg-lime-50">
            {isSelected && (
              <>
                toggle resize mode:::
                <Switch
                  checked={isResizeMode}
                  onCheckedChange={(checked) => {
                    setResizeMode(checked);
                    onToggleResizeMode(localFields, checked);
                  }}
                />
              </>
            )}
          </div>
*/}
          {localFields.sign}
        </div>
      </div>
    );
  },
);
