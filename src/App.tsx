import { Effect } from 'effect';
import { useEffect, useState } from 'react';
import { setHours, setMinutes } from 'date-fns';

import { getRecords, createOrUpdateRecord, getMe } from '@/api';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import * as Carousel from '@/components/ui/carousel';
import * as store from '@/store';

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

  const { fields } = store.editableRightNowCard();
  const isCardSelected = Boolean(fields);

  useEffect(() => {
    if (isCardSelected) {
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = '';
      });
    }
  }, [isCardSelected]);

  return (
    <>
      <main className="max-h-dvh">
        <Carousel.Host>
          <Carousel.Item className="min-w-full" aria-hidden="false">
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

          <Carousel.Item className="min-w-full" aria-hidden="false">
            <section className="max-h-svh overflow-hidden">
              <Timeline
                className="flex-1 relative bg-card border h-svh"
                currentDate={date}
                cards={records}
                onCardChange={({ id, ...rec }) => {
                  const idToOptimisticalSave = id || Date.now();
                  addRecord({ ...rec, id: idToOptimisticalSave });

                  Effect.runPromise(
                    createOrUpdateRecord({
                      ...rec,
                      id: id || undefined,
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
                    removeRecord(idToOptimisticalSave);
                    addRecord(res);
                  });
                }}
              />
            </section>

            <Drawer
              open={isCardSelected}
              modal={false}
              noBodyStyles={true}
              // dismissible={false}
            >
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>HELLOW</DrawerTitle>
                  <DrawerDescription>(privet)</DrawerDescription>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          </Carousel.Item>
        </Carousel.Host>
      </main>
    </>
  );
}
