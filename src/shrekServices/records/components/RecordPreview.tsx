import { memo, useState, useEffect, useLayoutEffect } from 'react';
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

    const [host, setHost] = useState<HTMLSpanElement | null>(null);

    useLayoutEffect(() => {
      let timerId = 0;
      if (host) {
        host.style.display = 'none';
        timerId = requestAnimationFrame(() => {
          host.style.display = '';
        });
      }
      return () => cancelAnimationFrame(timerId);
    }, [details, host]);

    return (
      <span
        ref={setHost}
        className={cn(
          'min-w-0.5 min-h-full h-full flex flex-col gap-0.5',
          isPreviewForClient && 'absolute z-[-1] inset-0 bg-success/30',
        )}
      >
        <span className="pb-1.5 flex flex-col gap-0.5 leading-3">
          {isOwner &&
            detailsForTheDay?.map((item, idx) => (
              <span
                key={idx}
                className={cn(
                  'min-h-[1lh] max-h-[2lh] bg-card rounded-full corner-shape-squircle overflow-x-hidden scrollbar-hidden',
                  item.hasPendings && 'bg-success/30',
                )}
              ></span>
            ))}
        </span>
      </span>
    );
  },
);
