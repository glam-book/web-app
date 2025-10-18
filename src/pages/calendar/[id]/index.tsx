import { useState, useEffect } from 'react';

import { useParams } from '@/router';
import { services, records, owner } from '@/shrekServices';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';
import * as Carousel from '@/components/ui/carousel';

export default function Id() {
  const params = useParams('/calendar/:id');

  useEffect(() => {
    owner.store.setState({ id: params.id });
  }, [params.id]);

  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: recordList } = records.useGet(params.id, date);
  const { fields: recordFields } = records.store.editableRightNow();
  const isCardSelected = Boolean(recordFields);

  useEffect(() => {
    if (isCardSelected) {
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = '';
      });
    }
  }, [isCardSelected]);

  return (
    <main className="max-h-dvh overscroll-none">
      <Carousel.Host>
        <Carousel.Item className="min-w-full">
          <article className="content-grid">
            <h1 className="my-4 highlighter text-center font-serif text-4xl">
              Glam book
            </h1>

            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-min justify-self-center"
            />
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
    </main>
  );
}
