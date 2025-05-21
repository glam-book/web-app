import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';
import { recordsStore } from '@/store/recordStore';

export function App() {
  const [date, setDate] = useState<Date>();

  const { records, addRecord, addRandom: _ } = recordsStore();

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
    </main>
  );
}
