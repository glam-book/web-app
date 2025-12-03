import { memo, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { differenceInMonths, startOfMonth, getDate } from 'date-fns';

import { owner, records } from '@/shrekServices';
import { between } from '@/utils';
import { cn } from '@/lib/utils';

export const RecordPreview = memo(
  ({ epoch, currentDate }: { epoch: Date; currentDate: Date }) => {
    const [shouldGetPreview, setShouldGetPreview] = useState(false);

    useEffect(() => {
      setShouldGetPreview(prev => {
        if (prev) return prev;

        return between(
          differenceInMonths(startOfMonth(epoch), startOfMonth(currentDate)),
          -1,
          1,
        );
      });
    }, [epoch, currentDate]);

    const { calendarId } = owner.store.getState();
    const { isOwner } = owner.useIsOwner();
    const { data: details } = records.useGetPreview(
      shouldGetPreview ? calendarId : undefined,
      startOfMonth(epoch),
    );

    const detailsForTheDay = details?.[getDate(epoch)];
    const isPreviewForClient =
      !isOwner && detailsForTheDay?.some(i => i.canPending);

    const hostRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
      const host = hostRef.current;
      let timerId = 0;
      if (host) {
        host.style.display = 'none';
        timerId = requestAnimationFrame(() => {
          host.style.display = '';
        });
      }
      return () => cancelAnimationFrame(timerId);
    }, [details]);

    return (
      <span
        ref={hostRef}
        className={cn(
          'min-w-0.5 min-h-full h-full grid auto-rows-min gap-0.5',
          isPreviewForClient && 'absolute z-[-1] inset-0 bg-teal-200/50',
        )}
      >
        {isOwner &&
          detailsForTheDay?.map((item, idx) => (
            <span
              key={idx}
              className={cn(
                'min-h-[0.8lh] h-[0.5lh] bg-card rounded-sm',
                item.hasPendings && 'bg-teal-200',
              )}
            />
          ))}
      </span>
    );
  },
);
