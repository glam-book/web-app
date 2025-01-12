import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';

export function App() {
  const [date, setDate] = useState<Date>();
  const [cards, setCards] = useState([
    {
      title: 'Record: 1',
      topPosition: 51.25,
    },
    {
      title: 'Record: 2',
      topPosition: 2.5 * 3 + 1.25,
    },
  ]);

  return (
    <main className="content-grid max-h-dvh overflow-y-auto snap-mandatory snap-y">
      <section className="grid-rows-[min-content] full-bleed content-grid snap-start">
        <h1 className="my-4 highlighter text-center font-serif text-4xl">
          Glam book
        </h1>

        <Button
          className="bg-blue-200"
          onClick={() => {
            const tg = window.Telegram.WebApp;
            const initData = tg.initData;
            console.log({ initData });
            const base64InitData = btoa(initData);

            fetch('https://glam.owpk.ru/get-profile', {
              method: 'GET',
              headers: {
                'X-tg-data': base64InitData,
              },
            })
              .then((res) => res.json())
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

        {/*<p className="mb-4 py-4 full-bleed content-grid bg-sky-50">
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
        </p>*/}
      </section>

      <section className="py-4 h-[94svh] flex flex-col snap-start">
        <h2 className="mb-4 self-center text-xl font-serif highlighter backdrop-blur-sm justify-self-center">
          Timeline:
        </h2>
        <Timeline
          className="flex-1 relative bg-card border"
          cards={cards}
          setCards={setCards}
        />
      </section>
    </main>
  );
}
