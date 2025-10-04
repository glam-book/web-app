import { Exit, Option, pipe } from 'effect';
import { useEffect, useState, use } from 'react';
import { addHours } from 'date-fns';

import { me } from '@/constants';
import { Record } from '@/schemas';
import { recordCards } from '@/shrekServices';
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
import { cn } from './lib/utils';
import { parseNonNullable } from './utils';

// я хз как вычислять первое значение
const stnapPoints = ['380px', 1];

export function App() {
  const { id: meId } = use(me);

  const [date, setDate] = useState<Date | undefined>(new Date());

  const { records } = recordCards.store.areself();

  useEffect(() => {
    if (date) {
      recordCards.actions.fetchList(meId, date).then(
        Exit.mapError(() =>
          recordCards.store.areself.setState({
            records: new Map([
              [
                1,
                Record.make({
                  id: 1,
                  from: date,
                  to: addHours(date, 1),
                  sign: 'FROM EXIT',
                }),
              ],
            ]),
          }),
        ),
      );
    }
  }, [date]);

  const { fields } = recordCards.store.editableRightNow();
  const isCardSelected = Boolean(fields);

  useEffect(() => {
    if (isCardSelected) {
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = '';
      });
    }
  }, [isCardSelected]);

  const [snap, setSnaps] = useState<number | null | string>(stnapPoints[0]);

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
                // onCardChange={({ id, ...rec /* ord */ }) => {
                // const idToOptimisticalSave = id || Date.now();
                // addRecord({ ...rec, id: idToOptimisticalSave });
                // Effect.runPromise(
                //   createOrUpdateRecord({
                //     ...rec,
                //     id: id || undefined,
                //   }).pipe(
                //     Effect.catchAll((error) => {
                //       console.warn(error);
                //       return Effect.succeed({
                //         id: idToOptimisticalSave,
                //         from: rec.from,
                //         to: rec.to,
                //         sign: 'test_resnichkee',
                //       });
                //     }),
                //   ),
                // ).then((res) => {
                //   removeRecord(idToOptimisticalSave);
                //   addRecord(res);
                // });
                // }}
              />
            </section>

            <Drawer
              open={isCardSelected}
              onClose={() => {
                recordCards.actions.finishEdit();
              }}
              noBodyStyles
              modal={false}
              // dismissible={false}
              snapPoints={stnapPoints}
              activeSnapPoint={snap}
              setActiveSnapPoint={setSnaps}
            >
              <DrawerContent className="max-h-[30svh]">
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
                              recordCards.store.editableRightNow.getState()
                                .fields,
                            ),
                            Option.map(editableFields => {
                              recordCards.setEditableFields({
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
