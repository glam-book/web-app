import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Timeline } from '@/components/ui/timeline';

export function App() {
  const [date, setDate] = useState<Date>();

  return (
    <main className="flex-1 py-4">
      <div className="content-grid justify-items-center">
        <h1 className="mb-6 highlighter text-center font-serif text-4xl">
          Glam book
        </h1>

        <form
          className="content-grid full-bleed space-y-4"
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
            className="flex-1"
          />

          <Button type="submit">Submit</Button>

          <p className="full-bleed content-grid bg-sky-50">
            <span className="content-xl">
              Consectetur ut incidunt ex quos modi. Magni accusantium tenetur
              aliquam fugit natus Adipisci odio tempore vitae quia tenetur, sint
              quaerat debitis, numquam? Accusantium molestiae quos quasi enim
              consequatur Voluptas corrupti?
            </span>
          </p>
          <p>
            Sit architecto excepturi eaque beatae ab. Eaque dolorum veritatis
            perspiciatis deserunt sapiente iusto eveniet ipsam Laboriosam
            temporibus vero quia porro ipsam Tempora ullam neque inventore
            doloremque quia? Ipsam harum totam.
          </p>

          <section className="pl-2 pt-2 pb-2 flex flex-col bg-card border">
            <h2 className="mb-4 self-center text-xl font-serif highlighter">
              Timeline:
            </h2>
            <Timeline className="relative">
              <div>Record:</div>
            </Timeline>
          </section>
        </form>
      </div>
    </main>
  );
}
