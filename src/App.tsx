import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';
import { recordsStore } from '@/store/record';
import { getRecordsWay } from '@/store/record/recordStore';

export function App() {
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    console.log({ date });
  }, [date]);

  const { records, addRecord, setRecords } = recordsStore();

  useEffect(() => {
    getRecordsWay().then(setRecords);
  }, [date]);

  // useEffect(() => {
  //   getRecords().then((rawRecords: Record<string, unknown>[]) => {
  //     setRecords(
  //       new Map(
  //         rawRecords.map((rawRecord) => {
  //           const res = recordMapper(rawRecord);
  //           return [res.id, res];
  //         }),
  //       ),
  //     );
  //     console.log(rawRecords);
  //   });
  // }, []);

  // useEffect(() => {
  //   console.log({ records });
  // }, [records]);

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
        className="fixed bottom-10 right-10 z-10 h-[2lh] aspect-square bg-amber-50 rounded-2xl border-solid border"
      >
        +
      </button>
    </main>
  );
}
