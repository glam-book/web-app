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

let tid = 0;

const f = (message: string) => {
  clearTimeout(tid);
  tid = window.setTimeout(() => alert(message), 100);
};

export const Detail = memo(
  ({ epoch, currentDate }: { epoch: Date; currentDate: Date }) => {
    const [shouldGetPreview, setShouldGetPreview] = useState(false);

    useEffect(() => {
      setShouldGetPreview(prev => {
        if (prev) return prev;

        return between(
          differenceInMonths(startOfMonth(epoch), startOfMonth(currentDate)),
          0,
          0,
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
    const isPreviewForClient = !isOwner && detailsForTheDay?.some(i => i.canPending);

    useEffect(() => {
      f(
        JSON.stringify({
          details,
          shouldGetPreview,
          calendarId,
          isOwner,
        }),
      );
    }, [details, shouldGetPreview, calendarId, isOwner]);

    return (
      <span
        className={cn(
          'min-h-full flex flex-col gap-0.5',
          isPreviewForClient && 'absolute z-[-1] inset-0 bg-teal-200/50',
        )}
      >
        {isOwner &&
          detailsForTheDay?.map((item, idx) => (
            <span
              key={idx}
              className={cn(
                'h-[0.5lh] bg-red-300',
                item.hasPendings && 'bg-teal-200',
              )}
            />
          ))}
      </span>
    );
  },
);

export default function Id() {
  const params = useParams('/calendar/:id');

  useEffect(() => {
    owner.store.setState({ calendarId: params.id });
  }, [params.id]);

  const [date, setDate] = useState(new Date());

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

  const { isOwner } = owner.useIsOwner();

  return (
    <main className="flex flex-col gap-0.5 max-h-dvh overscroll-none">
      <header className="flex justify-between">
        <span
          className={cn(
            'flex-1 flex items-center font-serif text-xl indent-2',
            isOwner && 'bg-card',
          )}
        />
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
        <Carousel.Item className="flex-1 min-w-full flex">
          <article className="flex-1 flex flex-col">
            <div className="overflow-hidden">
              <Era
                onSelect={setDate}
                selected={date}
                className="without-gap"
                Detail={Detail}
              />
            </div>
          </article>
        </Carousel.Item>

        <Carousel.Item className="flex-1 min-w-full">
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

      <footer className="">FOOTER::::MUT</footer>

      <Toaster />
    </main>
  );
}
