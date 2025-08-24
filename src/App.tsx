import { Effect } from 'effect';
import { useEffect, useState } from 'react';

import { getRecords, createOrUpdateRecord, getMe } from '@/api';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';
import * as store from '@/store';
import type { WithoutReadonly, Prettify } from '@/types';

export function App() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initData;
    store.externalData.setState({ data: user ?? '' });
    console.log({ user });
  }, []);

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
                    from: new Date('2024-12-26T11:20:00.000Z'),
                    to: new Date('2024-12-26T12:25:00.000Z'),
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
    <main className="content-grid max-h-dvh overflow-y-auto snap-mandatory snap-y">
      <section className="grid-rows-[min-content] full-bleed content-grid snap-start">
        <h1 className="my-4 highlighter text-center font-serif text-4xl">
          Glam book
        </h1>

        <form
          className="pb-4 flex flex-col flex-1 space-y-4"
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            console.log(date);
          }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />

          <Button type="submit">Submit</Button>
        </form>

        <p className="mb-4 py-4 full-bleed content-grid bg-sky-50">
          <span className="content-xl border border-dashed">
            Consectetur ut incidunt ex quos modi. Magni accusantium tenetur
            aliquam fugit natus Adipisci odio tempore vitae quia tenetur, sint
            quaerat debitis, numquam? Accusantium molestiae quos quasi enim
            consequatur Voluptas corrupti?
          </span>
        </p>

        <p className="mb-4">
          Sit architecto excepturi eaque beatae ab. Eaque dolorum veritatis
          perspiciatis deserunt sapiente iusto eveniet ipsam Laboriosam
          temporibus vero quia porro ipsam Tempora ullam neque inventore
          doloremque quia? Ipsam harum totam.
        </p>
      </section>

      <section className="pb-1 h-[99svh] flex flex-col snap-start">
        <Timeline
          className="flex-1 relative bg-card border"
          cards={records}
          onCardChange={(fields) => {
            const rec: Prettify<
              WithoutReadonly<Parameters<typeof createOrUpdateRecord>[0]>
            > = {
              ...fields,
            };

            const id = rec.id || Date.now();
            addRecord({ ...rec, id });

            Effect.runPromise(
              createOrUpdateRecord({ ...rec, id: rec.id || undefined }).pipe(
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
    </main>
  );
}
