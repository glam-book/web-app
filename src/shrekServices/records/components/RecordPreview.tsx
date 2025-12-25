import { memo, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { differenceInMonths, startOfMonth, getDate } from 'date-fns';
import { Circle as Dot } from 'lucide-react';

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

    // const detailItemsFitsCount = useMemo(() => {
    //   if (!host) return 0;
    //   const height = host.offsetHeight;
    //   const computedStyles = window.getComputedStyle(host);
    //   const itemHeight = parseFloat(computedStyles.lineHeight);
    //   const gap =
    //     parseFloat(computedStyles.getPropertyValue('--spacing')) * 0.5;

    //   const itemsCount = Math.floor(height / itemHeight;
    // }, [detailsForTheDay?.length, host]);

    const isFitsInHeight = (): boolean => {
      if (!host) return false;
      if (!detailsForTheDay?.length) return false;

      const height = host.offsetHeight;
      const computedStyles = window.getComputedStyle(host);
      const itemHeight = parseFloat(computedStyles.lineHeight);
      const gap =
        parseFloat(computedStyles.getPropertyValue('--spacing')) * 0.5;

      const result =
        height >
        itemHeight * detailsForTheDay.length +
          gap * (detailsForTheDay.length - 1);

      return result;
    };

    return (
      <span
        ref={setHost}
        className={cn(
          'min-w-0.5 min-h-full h-full flex flex-col gap-0.5',
          isPreviewForClient && 'absolute z-[-1] inset-0 bg-teal-200/50',
        )}
      >
        {isOwner &&
          detailsForTheDay
            ?.slice(0, isFitsInHeight() ? detailsForTheDay.length : 2)
            .map((item, idx) => (
              <span
                key={idx}
                className={cn(
                  'min-h-[1lh] bg-card rounded-sm',
                  item.hasPendings && 'bg-teal-200',
                )}
              />
            ))}
        {isOwner && detailsForTheDay?.length && !isFitsInHeight() && (
          <span className="flex gap-1 pt-0.5 pl-0.5">
            {Array.from({ length: 3 }, () => (
              <Dot className="fill-muted-foreground stroke-0 h-2 w-2" />
            ))}
          </span>
        )}
      </span>
    );
  },
);
