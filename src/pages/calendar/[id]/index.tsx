import { useState, useEffect } from 'react';
import { Effect, Option, pipe } from 'effect';

import { useParams } from '@/router';
import * as services from '@/shrekServices';
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
import { cn } from '@/lib/utils';
import { RecordWitoutId } from '@/schemas';

// я хз как вычислять первое значение
const snapPoints = ['30svh', 1];

export default function Id() {
  const params = useParams('/calendar/:id');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: records } = services.recordCards.useGet(params.id, date);

  useEffect(() => {
    console.log(
      Effect.runSync(
        pipe(
          Option.some(1),
          Effect.map(_ => 42),
        ),
      ),
    );
    if (records?.get(1)) {
      console.log(RecordWitoutId.make(records.get(1)!), 'dhsiadhsa');
    }
  }, [records]);

  const { fields } = services.recordCards.store.editableRightNow();
  const isCardSelected = Boolean(fields);

  useEffect(() => {
    if (isCardSelected) {
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = '';
      });
    }
  }, [isCardSelected]);

  const [snap, setSnaps] = useState<number | null | string>(snapPoints[0]);

  return (
    <>
      <main className="max-h-dvh overscroll-none">
        <Carousel.Host
          onScroll={() => {
            console.log('scrolling...');
          }}
          onScrollEnd={() => {
            console.log('scrolling... END!');
          }}
        >
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
              />
            </section>

            <Drawer
              open={isCardSelected}
              onClose={services.recordCards.finishEdit}
              noBodyStyles
              modal={false}
              // snapPoints={snapPoints}
              // activeSnapPoint={snap}
              // setActiveSnapPoint={setSnaps}
            >
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>HELLOW</DrawerTitle>
                  <DrawerDescription>(privet)</DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col flex-1">
                  <section
                    className={cn(
                      'flex flex-col',
                      snap === 1 ? 'overflow-scroll' : 'overflow-hidden',
                    )}
                  >
                    <form action="" id="edit-record-card">
                      <textarea
                        id=""
                        name=""
                        defaultValue={fields?.sign}
                        onBlur={e => {
                          pipe(
                            Option.fromNullable(
                              services.recordCards.store.editableRightNow.getState()
                                .fields,
                            ),
                            Option.map(editableFields => {
                              services.recordCards.setEditableFields({
                                ...editableFields,
                                sign: e.currentTarget.value,
                              });
                            }),
                          );
                        }}
                      ></textarea>
                    </form>
                  </section>
                </div>
              </DrawerContent>
            </Drawer>
          </Carousel.Item>
        </Carousel.Host>
      </main>
    </>
  );
}
