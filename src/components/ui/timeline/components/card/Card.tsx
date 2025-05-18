import { useState, useEffect, useRef, memo } from 'react';

import { Switch } from '@/components/ui/switch';
import { useFreakyState } from '@/hooks';

import type { CardProps } from './types';

const checkIsCardChanged = (
  fields: CardProps['fields'],
  comparingFields: CardProps['fields'],
) =>
  fields.position !== comparingFields.position ||
  fields.size !== comparingFields.size ||
  fields.sign !== comparingFields.sign;

export const Card = memo<CardProps>(
  ({
    fields,
    aimPosition,
    minCardSize = 2.5,
    toDisplayUnits,
    onChange,
    onSelectCard,
    onBlurCard,
    onToggleResizeMode,
  }) => {
    const [localFields, setLocalFields] = useFreakyState(fields);
    const [isResizeMode, setResizeMode] = useState(false);
    const wasClickedOnTheCard = useRef(false);
    const [isSelected, setSelected] = useState(false);

    useEffect(() => {
      console.log({ aimPosition });
    }, [aimPosition]);
    useEffect(() => {
      console.log({ localFields });
    }, [localFields]);
    useEffect(() => {
      console.log({ fields });
    }, [fields]);

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
        setLocalFields((prev) => ({
          ...prev,
          position:
            isResizeMode && aimPosition > prev.position
              ? prev.position
              : aimPosition,
          size: isResizeMode
            ? Math.max(aimPosition - prev.position, minCardSize)
            : prev.size,
        }));
      }
    }, [isSelected, aimPosition, setLocalFields, minCardSize, isResizeMode]);

    useEffect(() => {
      if (!isSelected && checkIsCardChanged(fields, localFields)) {
        onChange(localFields);
        onBlurCard?.(localFields);
      }
    }, [isSelected, onBlurCard, onChange, localFields, fields]);

    const onClick = () => {
      wasClickedOnTheCard.current = true;
      setSelected(true);
      onSelectCard?.(localFields);
    };

    return (
      <div
        role="button"
        className="absolute w-full bg-[tomato] transition-foo"
        onClick={onClick}
        tabIndex={0}
        style={{
          top: toDisplayUnits(localFields.position),
          height: toDisplayUnits(localFields.size),
        }}
      >
        <div className="absolute w-full flex -translate-y-full bg-lime-50">
          {isSelected && (
            <Switch
              checked={isResizeMode}
              onCheckedChange={(checked) => {
                setResizeMode(checked);
                onToggleResizeMode(checked, localFields);
              }}
            />
          )}
        </div>

        <div className="sticky top-0 w-full min-h-[2.5lh] text-2xs select-none overflow-y-visible">
          {localFields.sign}
        </div>
      </div>
    );
  },
);
