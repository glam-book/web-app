import { useState, useEffect, useRef } from 'react';

import { useParams } from '@/router';
import { services, records, owner } from '@/shrekServices';
import { Era } from '@/components/ui/era';
import { Timeline } from '@/components/ui/timeline';
import * as Carousel from '@/components/ui/carousel';
import type { HostApi } from '@/components/ui/carousel';
import { Toaster } from '@/components/ui/sonner';

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
    <main className="max-h-dvh overscroll-none">
      <Carousel.Host ref={carouselApi}>
        <Carousel.Item className="min-w-full">
          <article className="flex flex-col min-h-dvh max-h-dvh">
            <div className="content-grid flex-1 overflow-hidden">
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
