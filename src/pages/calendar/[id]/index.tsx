import { useState, useEffect, useRef } from 'react';
import { Share } from 'lucide-react';
import { shareURL } from '@tma.js/sdk-react';

import { useParams } from '@/router';
import { services, records, owner } from '@/shrekServices';
import { Era } from '@/components/ui/era';
import { Timeline } from '@/components/ui/timeline';
import * as Carousel from '@/components/ui/carousel';
import type { HostApi } from '@/components/ui/carousel';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';

export default function Id() {
  const params = useParams('/calendar/:id');

  useEffect(() => {
    owner.store.setState({ calendarId: params.id });
  }, [params.id]);

  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: recordList } = records.useGet(params.id, date);
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

  return (
    <main className="flex flex-col gap-0.5 max-h-dvh overscroll-none">
      <header className="flex justify-between items-center">
        <Button
          aria-label="Share"
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => {
            const o = { calendarId: params.id };
            shareURL(
              `https://t.me/glambookbot/slapdash?startapp=${JSON.stringify(o)}`,
              'CALENDAR',
            );
            // navigator
            //   .share({
            //     url: `https://t.me/glambookbot/slapdash?startapp=${JSON.stringify(o)}`,
            //     title: 'GLAM APP (betta)',
            //   })
            //   .catch(e => {
            //     console.warn(e);
            //   });
          }}
        >
          <Share />
        </Button>
      </header>

      <Carousel.Host className="flex-1 overflow-y-hidden" ref={carouselApi}>
        <Carousel.Item className="min-w-full flex">
          <article className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <Era onSelect={setDate} selected={date} className="without-gap" />
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
