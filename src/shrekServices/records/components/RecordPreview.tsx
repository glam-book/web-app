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
    const [detailsWrapper, setDetailsWrapper] =
      useState<HTMLSpanElement | null>(null);

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

    const detailItemsFitsCount = useMemo(() => {
      if (!detailsWrapper) return 0;
      const height = detailsWrapper.offsetHeight;
      const computedStyles = window.getComputedStyle(detailsWrapper);
      const itemHeight = parseFloat(computedStyles.lineHeight);
      const gap = parseFloat(computedStyles.getPropertyValue('--spacing')) * 8;

      const itemsCount = Math.max(
        0,
        Math.floor((height - itemHeight) / (itemHeight + gap)) + 1,
      );

      return itemsCount;
    }, [detailsForTheDay?.length, detailsWrapper]);

    const isAllDetailItemsFits =
      detailItemsFitsCount >= detailsForTheDay?.length!;

    return (
      <span
        ref={setHost}
        className={cn(
          'min-w-0.5 min-h-full h-full flex flex-col gap-0.5',
          isPreviewForClient && 'absolute z-[-1] inset-0 bg-teal-200/50',
        )}
      >
        <span
          className="flex-1 flex flex-col gap-0.5 text-xs"
          ref={setDetailsWrapper}
        >
          {isOwner &&
            detailsForTheDay
              ?.slice(
                0,
                isAllDetailItemsFits
                  ? detailsForTheDay.length
                  : detailItemsFitsCount,
              )
              .map((item, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'min-h-[1lh] h-[1lh] bg-card rounded-sm',
                    item.hasPendings && 'bg-teal-200',
                  )}
                />
              ))}
        </span>
        <span
          className={cn(
            'flex gap-1 pt-0.5 pl-0.5 invisible',
            isOwner &&
              detailsForTheDay?.length &&
              !isAllDetailItemsFits &&
              'visible',
          )}
        >
          {Array.from({ length: 3 }, () => (
            <Dot className="fill-muted-foreground/60 stroke-0 h-2 w-2" />
          ))}
        </span>
      </span>
    );
  },
);
