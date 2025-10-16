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
import { records } from '@/shrekServices';
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

    // const root = useRef<HTMLDivElement>(null);
    // const [startTouches, setStartTouches] = useState<
    //   [number, number] | undefined
    // >(undefined);
    // const touchXCoordRightAfterStart = useRef<number | undefined>(undefined);
    // const [isSwipeForActionAllowed, setSwipeForActionAllowed] = useState(false);
    // const [left, setLeft] = useState(0);
    // const [fuck, setFuck] = useState(false);

    // useEffect(() => {
    //   window.addEventListener(
    //     'scrollend',
    //     () => {
    //       console.log('scroll END from window');
    //       setFuck(false);
    //     },
    //     true,
    //   );

    //   window.addEventListener(
    //     'scroll',
    //     () => {
    //       console.log('scroll from window');
    //       setFuck(true);
    //     },
    //     true,
    //   );
    // }, []);

    return (
      <ContextMenu>
        <ContextMenuTrigger onKeyDown={e => e.preventDefault()}>
          <div
            // ref={root}
            role="button"
            tabIndex={0}
            // onTouchStart={(e) => {
            //   if (isSwipeForActionAllowed || left !== 0) {
            //     e.preventDefault();
            //   }
            //   setStartTouches([e.touches[0].clientX, e.touches[0].clientY]);
            // }}
            // onTouchMove={(e) => {
            //   if (fuck) return;

            //   const [startTouchX, startTouchY] = startTouches ?? [];

            //   if (touchXCoordRightAfterStart.current === undefined) {
            //     touchXCoordRightAfterStart.current = e.touches[0].clientX;

            //     if (
            //       Math.abs(startTouchX!) >
            //         Math.abs(touchXCoordRightAfterStart.current) &&
            //       Math.abs(startTouchY! - e.touches[0].clientY) <= 10
            //     ) {
            //       console.log(e.touches[0].clientY, startTouches?.[1]);
            //       setSwipeForActionAllowed(true);
            //       onSwipeStart();
            //       onSwipe(true);
            //       document.body.style.overscrollBehaviorX = 'none';
            //       console.log('hihe');
            //     }
            //   }

            //   if (isSwipeForActionAllowed) {
            //     pipe(
            //       root.current,
            //       parseNonNullable,
            //       Option.map((nonNullableRoot) => {
            //         const nextLeft = Math.min(
            //           e.touches[0].clientX - startTouches?.[0] ?? 0,
            //           0,
            //         );

            //         setLeft(nextLeft);
            //         console.log({ nextLeft });
            //         // nonNullableRoot.style.left = `${Math.min(nextLeft, 0)}px`;
            //       }),
            //     );
            //   }
            // }}
            // onTouchEnd={(e) => {
            //   pipe(
            //     root.current,
            //     parseNonNullable,
            //     Option.map((nonNullableRoot) => {
            //       setLeft(0);
            //       // nonNullableRoot.style.left = '0';
            //     }),
            //   );

            //   requestAnimationFrame(() => {
            //     console.log('end of swipe');
            //     touchXCoordRightAfterStart.current = undefined;
            //     setStartTouches(undefined);
            //     onSwipe(false);
            //     document.body.style.overscrollBehaviorX = '';
            //     onSwipeEnd();
            //     setSwipeForActionAllowed(false);
            //   });
            // }}
            onClick={onClick}
            className={cn(
              'flex absolute w-full',
              isSelected && 'shadow-2xl z-1 translate-y-0 translate-x-5',
              'transition-foo',
            )}
            style={{
              top: convertToSpecificDisplayUnits(displayedFields.top),
              height: convertToSpecificDisplayUnits(displayedFields.size),
              // left: fuck ? 0 : `${left}px`,
            }}
          >
            <div
              className={cn(
                'min-w-full min-h-[2.5lh] text-2xs select-none transition-foo bg-card',
                isSelected && 'bg-[tomato]',
              )}
            >
              {/*<p className="absolute top-0 flex w-full h-full justify-center items-center text-muted-foreground">
            {fields.id}
          </p>*/}

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

                {!isSelected && <p className="text-left">{fields.sign}</p>}
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
