import { Effect } from 'effect';
import { useEffect, useState } from 'react';

import { getRecords } from '@/api';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';
import { store } from '@/store';

export function App() {
  const [date, setDate] = useState<Date>(new Date());

  const { records, addRecord, setRecords } = store.records();

  useEffect(() => {
    Effect.runPromise(
      getRecords().pipe(
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
  }, [date]);

  return (
    <main className="content-grid max-h-dvh overflow-y-auto snap-mandatory snap-y">
      <section className="grid-rows-[min-content] full-bleed content-grid snap-start">
        <h1 className="my-4 highlighter text-center font-serif text-4xl">
          Glam book
        </h1>

        <Button
          variant="secondary"
          onClick={() => {
            const tg = window.Telegram.WebApp;
            const user = tg.initData;
            console.log({ user });

            fetch('https://tantal.owpk.ru/api', {
              method: 'GET',
              headers: {
                'X-tg-data': user,
              },
            })
              .then(console.log)
              .catch(console.error);
          }}
        >
          Telegram test button
        </Button>

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
          onCardChange={addRecord}
        />
      </section>

      <button
        type="button"
        onClick={() => {
          fetch('http://localhost:8095/api/v1/record/creat_or_update_record', {
            method: 'POST',
            body: JSON.stringify({
              id: 2,
              ts_from: '2025-06-03T10-30-00',
              ts_to: '2025-06-03T11-30-00',
              service_info_id: 1,
            }),
          });
        }}
        className="fixed bottom-0 right-1/2 translate-x-2/1 -translate-y-1/2 h-[3em] aspect-square bg-amber-400 rounded-2xl border-solid border"
      >
        +
      </button>
    </main>
  );
}
