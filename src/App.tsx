import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';

export function App() {
  const [date, setDate] = useState<Date>();
  // const [is, setIs] = useState(false);
  const [cards, setCards] = useState([
    {
      sign: 'Record: 1',
      startTime: Date.now(),
      endTime: Date.now() + 10 * 60 * 1000,
      id: '1',
    },
    // {
    //   title: 'Record: 2',
    //   topPosition: 2.5 * 3 + 1.25,
    // },
  ]);

  return (
    <main className="content-grid max-h-dvh overflow-y-auto snap-mandatory snap-y">
      <section className="grid-rows-[min-content] full-bleed content-grid snap-start">
        <h1 className="my-4 highlighter text-center font-serif text-4xl">
          Glam book
        </h1>

        <Button
          className="bg-avocado"
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
