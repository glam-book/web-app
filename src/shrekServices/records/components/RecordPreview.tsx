import { memo, useState, useEffect, useMemo, useLayoutEffect } from 'react';
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
      if (!host) return 0;
      if (!detailsForTheDay?.length) return 0;

      const height = host.offsetHeight;
      const computedStyles = window.getComputedStyle(host);
      const itemHeight = parseFloat(computedStyles.lineHeight);
      const remInPx = parseFloat(
        window.getComputedStyle(document.documentElement).fontSize,
      );
      const spacing =
        parseFloat(computedStyles.getPropertyValue('--spacing')) * remInPx;
      const gap = spacing * 0.5;
      const dotsHeight = spacing * 2;

      const preItemsCount = Math.max(
        0,
        Math.floor((height - itemHeight) / (itemHeight + gap)) + 1,
      );

      const result =
        preItemsCount < detailsForTheDay.length
          ? Math.max(
              0,
              Math.floor(
                (height - itemHeight - (dotsHeight + gap)) / (itemHeight + gap),
              ) + 1,
            )
          : preItemsCount;

      return result;
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
          className="flex flex-col gap-0.5 leading-3"
          ref={setDetailsWrapper}
        >
          {isOwner &&
            detailsForTheDay
              // ?.slice(0, detailItemsFitsCount)
              ?.map((item, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'min-h-[1lh] max-h-[2lh] bg-card rounded-[0.3rem] text-[8px] overflow-x-auto',
                    item.hasPendings && 'bg-teal-200',
                  )}
                ></span>
              ))}
        </span>
        {/*
        <span
          className={cn(
            'hidden gap-1 pt-0.5 pl-0.5',
            isOwner &&
              detailsForTheDay?.length &&
              !isAllDetailItemsFits &&
              'flex',
          )}
        >
          {Array.from({ length: 3 }, (_, idx) => (
            <Dot
              key={idx}
              className="fill-muted-foreground/60 stroke-0 h-2 w-2"
            />
          ))}
        </span>
          */}
      </span>
    );
  },
);
