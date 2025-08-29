import { Effect } from 'effect';
import { useEffect, useState } from 'react';
import {add, setHours, setMinutes} from 'date-fns';

import { getRecords, createOrUpdateRecord, getMe } from '@/api';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';
import { Drawer } from '@/components/ui/drawer';
import * as Carousel from '@/components/ui/carousel';
import * as store from '@/store';
import type { Writable, Prettify } from '@/types';

export function App() {
  const { id: meId } = store.me();

  useEffect(() => {
    Effect.runPromise(
      getMe().pipe(
        Effect.catchAll((error) => {
          console.warn(error);
          return Effect.succeed({ id: Date.now() });
        }),
      ),
    ).then((res) => store.me.setState({ id: res.id }));
  }, []);

  const [date, setDate] = useState<Date | undefined>(new Date());

  const { records, addRecord, setRecords, removeRecord } = store.records();

  useEffect(() => {
    if (meId) {
      Effect.runPromise(
        getRecords(meId, date).pipe(
          Effect.catchAll((error) => {
            console.warn(error);
            return Effect.succeed(
              new Map([
                [
                  1,
                  {
                    id: 1,
                    from: setMinutes(setHours(date!, 12), 0),
                    to: setMinutes(setHours(date!, 13), 30),
                    sign: 'test_resnichkee',
                  },
                ],
              ]),
            );
          }),
        ),
      ).then(setRecords);
    }
  }, [date, meId]);

  return (
    <main className="max-h-dvh">
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
              initialFocus
              className="w-min justify-self-center"
            />
          </article>
        </Carousel.Item>

        <Carousel.Item className="min-w-full">
          <section className="max-h-svh overflow-hidden">
            <Timeline
              className="flex-1 relative bg-card border h-svh"
              currentDate={date}
              cards={records}
              onCardChange={(fields) => {
                const rec: Prettify<
                  Writable<Parameters<typeof createOrUpdateRecord>[0]>
                > = {
                  ...fields,
                };

                const id = rec.id || Date.now();
                addRecord({ ...rec, id });

                Effect.runPromise(
                  createOrUpdateRecord({
                    ...rec,
                    id: rec.id || undefined,
                  }).pipe(
                    Effect.catchAll((error) => {
                      console.warn(error);
                      return Effect.succeed({
                        id,
                        from: rec.from,
                        to: rec.to,
                        sign: 'test_resnichkee',
                      });
                    }),
                  ),
                ).then((res) => {
                  removeRecord(id);
                  addRecord(res);
                });
              }}
            />
          </section>
        </Carousel.Item>
      </Carousel.Host>
    </main>
  );
}
