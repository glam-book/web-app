import { format } from 'date-fns';
import { useState, useEffect, memo, useCallback } from 'react';
import { flow, pipe } from 'effect';
import { TrashIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';
import { Sdometer } from '@/components/ui/sdometer';
import { setMinutesToDate } from '@/components/ui/timeline/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuPortal,
} from '@/components/ui/context-menu';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { records, services } from '@/shrekServices';
import { activeCard } from '@/components/ui/timeline/store';

import type { CardProps } from './types';

export const Card = memo(
  ({
    fields,
    aimPosition,
    isSelected,
    minCardSize = 2.5,
    convertToSpecificDisplayUnits,
    dateToDisplayUnits,
    displayUnitsToMinutes,
    clickHandler,
  }: CardProps) => {
    const calcDisplayedFields = useCallback(
      () => ({
        top: dateToDisplayUnits(fields.from),
        size: flow(
          () => [fields.from, fields.to].map(dateToDisplayUnits),
          ([from, to]) => to - from,
        )(),
      }),
      [fields, dateToDisplayUnits],
    );

    const [displayedFields, setDisplayedFields] = useState(calcDisplayedFields);

    useEffect(() => {
      if (isSelected) {
        setDisplayedFields(prev => ({
          top: activeCard.getState().isResizeMode
            ? Math.min(aimPosition, prev.top)
            : aimPosition,

          size: activeCard.getState().isResizeMode
            ? Math.max(aimPosition - prev.top, minCardSize)
            : prev.size,
        }));
      }
    }, [isSelected, aimPosition, minCardSize]);

    useEffect(() => {
      const { fields: editableFields } =
        records.store.editableRightNow.getState();

      if (isSelected && editableFields) {
        records.store.editableRightNow.setState({
          fields: {
            ...editableFields,

            from: pipe(
              displayedFields.top,
              displayUnitsToMinutes,
              setMinutesToDate(editableFields.from),
            ),

            to: pipe(
              displayedFields.top + displayedFields.size,
              displayUnitsToMinutes,
              setMinutesToDate(editableFields.to),
            ),
          },
        });
      }
    }, [displayedFields, displayUnitsToMinutes, isSelected]);

    const onClick = () => {
      clickHandler(fields);
    };

    const { data: serviceList } = services.useGet();

    return (
      <ContextMenu>
        <ContextMenuTrigger onKeyDown={e => e.preventDefault()}>
          <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            className={cn(
              'flex absolute w-full',
              isSelected && 'shadow-2xl z-1 translate-y-0 translate-x-5',
              'transition-foo',
            )}
            style={{
              top: convertToSpecificDisplayUnits(displayedFields.top),
              height: convertToSpecificDisplayUnits(displayedFields.size),
            }}
          >
            <div
              className={cn(
                'min-w-full min-h-[2.5lh] text-2xs select-none transition-foo bg-card',
                isSelected && 'bg-[tomato]',
              )}
            >
              <div className="sticky top-0">
                {isSelected && (
                  <div className="flex font-mono">
                    <time
                      className={cn(
                        activeCard.getState().isResizeMode || 'text-stands-out',
                        'inline-flex',
                      )}
                      dateTime={format(
                        String(
                          records.store.editableRightNow.getState().fields
                            ?.from,
                        ),
                        'MM-dd',
                      )}
                    >
                      <Sdometer
                        value={format(
                          String(
                            records.store.editableRightNow.getState().fields
                              ?.from,
                          ),
                          'HH:mm',
                        )}
                      />
                    </time>
                    {'-'}
                    <time
                      className={cn(
                        activeCard.getState().isResizeMode && 'text-stands-out',
                        'inline-flex',
                      )}
                      dateTime={format(
                        String(
                          records.store.editableRightNow.getState().fields?.to,
                        ),
                        'MM-dd',
                      )}
                    >
                      <Sdometer
                        value={format(
                          String(
                            records.store.editableRightNow.getState().fields
                              ?.to,
                          ),
                          'HH:mm',
                        )}
                      />
                    </time>
                  </div>
                )}

                {!isSelected && (
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <p className="text-left">{fields.sign}</p>
                      <div className="flex gap-0.5">
                        {Array.from(fields.serviceIdList, serviceId => {
                          const title = serviceList?.get(serviceId)?.title;
                          return (
                            title && (
                              <Badge
                                className="bg-[deepskyblue] font-bold font-mono"
                                variant="destructive"
                                key={serviceId}
                              >
                                {title}
                              </Badge>
                            )
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-1">
                      <Toggle
                        variant="outline"
                        className="text-sm font-mono font-bold border-destructive"
                        onPressedChange={e => console.log(e)}
                        onClick={e => e.stopPropagation()}
                      >
                        {fields.pendings.active}/{fields.pendings.limits}
                      </Toggle>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuItem
              variant="destructive"
              onClick={e => {
                console.log('hihs');
                e.stopPropagation();
                records.deleteOne(fields.id);
              }}
            >
              <TrashIcon />
              Удалить
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    );
  },
);
