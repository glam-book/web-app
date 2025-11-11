import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Share } from 'lucide-react';
import { shareURL } from '@tma.js/sdk-react';
import { differenceInMonths, getDate, startOfMonth } from 'date-fns';
import { toast } from 'sonner';

import { useParams } from '@/router';
import { services, records, owner } from '@/shrekServices';
import { Era } from '@/components/ui/era';
import { Timeline } from '@/components/ui/timeline';
import * as Carousel from '@/components/ui/carousel';
import type { HostApi } from '@/components/ui/carousel';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { between } from '@/utils';

const Detail = memo(({ month }: { month: Date }) => {
  const { calendarId } = owner.store.getState();
  const { isOwner } = owner.useIsOwner();
  const { data: details } = records.useGetPreview(
    calendarId,
    startOfMonth(month),
  );
  const detailsForTheDay = details?.[getDate(month)];
  const isPreviewForClient =
    !isOwner && detailsForTheDay?.some(i => i.canPending);

  return (
    <span
      className={cn(
        'min-h-full flex flex-col gap-0.5 empty:hidden',
        isPreviewForClient && 'bg-teal-200',
      )}
    >
      {isOwner &&
        detailsForTheDay?.map((item, idx) => (
          <span
            key={idx}
            className={cn(
              'h-[0.5lh] bg-card',
              item.hasPendings && 'bg-teal-200',
            )}
          />
        ))}
    </span>
  );
});

export default function Id() {
  const params = useParams('/calendar/:id');

  useEffect(() => {
    owner.store.setState({ calendarId: params.id });
  }, [params.id]);

  const [date, setDate] = useState<Date>(new Date());
  const [visibleMonth, setVisibleMonth] = useState(date);

  const { data: recordList, error: errorRecordList } = records.useGet(
    params.id,
    date,
  );

  useEffect(() => {
    if (errorRecordList) {
      toast.error(JSON.stringify(errorRecordList));
    }
  }, [errorRecordList]);

  const { fields: recordFields } = records.store.editableRightNow();
  const isCardSelected = Boolean(recordFields);

  useEffect(() => {
    let afid: number;

    if (isCardSelected) {
      afid = requestAnimationFrame(() => {
        document.body.style.pointerEvents = '';
      });
    }

    return () => cancelAnimationFrame(afid);
  }, [isCardSelected]);

  const carouselApi = useRef<HostApi>(null);

  useEffect(() => {
    return () => carouselApi.current?.next(1);
  }, [date]);

  const DetailsForTheDay = useCallback(
    ({ date }: { date: Date }) =>
      between(differenceInMonths(date, visibleMonth), 0, 1) && (
        <Detail month={date} />
      ),
    [visibleMonth],
  );

  const { isOwner } = owner.useIsOwner();

  return (
    <main className="flex flex-col gap-0.5 max-h-dvh overscroll-none">
      <header className="flex justify-between items-center">
        <span className="font-serif text-xl indent-2">
          isOwner: {String(isOwner)}
        </span>
        <Button
          aria-label="Share"
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => {
            const startAppParam = { calendarId: params.id };
            shareURL(
              `https://t.me/glambookbot/slapdash?startapp=${btoa(JSON.stringify(startAppParam))}`,
            );
          }}
        >
          <Share />
        </Button>
      </header>

      <Carousel.Host className="flex-1 overflow-y-hidden" ref={carouselApi}>
        <Carousel.Item className="min-w-full flex">
          <article className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <Era
                onSelect={setDate}
                selected={date}
                onChangeVisibleMonth={setVisibleMonth}
                className="without-gap"
                Detail={DetailsForTheDay}
              />
            </div>
          </article>
        </Carousel.Item>

        <Carousel.Item className="min-w-full">
          <section className="max-h-svh overflow-hidden">
            <Timeline
              className="flex-1 relative bg-card border h-svh"
              currentDate={date}
              cards={recordList}
            />
          </section>

          <records.EditRecordModal />

          <services.components.EditService />
        </Carousel.Item>
      </Carousel.Host>

      <Toaster />
    </main>
  );
}
