import { useState, useEffect } from 'react';

import { useParams } from '@/router';
import { services, records } from '@/shrekServices';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

// я хз как вычислять первое значение
const snapPoints = ['230px', 1];

export default function Id() {
  const params = useParams('/calendar/:id');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: recordList } = records.useGet(params.id, date);

  const { fields } = records.store.editableRightNow();
  const isCardSelected = Boolean(fields);

  const { data: serviceList = new Map([[1, { id: 1, title: 'service 💅' }]]) } =
    services.useGet(params.id);

  useEffect(() => {
    if (isCardSelected) {
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = '';
      });
    }
  }, [isCardSelected]);

  const [snap, setSnap] = useState<number | null | string>(snapPoints[0]);
  const [editServiceModalIsOpen, setEditServiceModalOpen] = useState(false);

  useEffect(() => {
    setSnap(snapPoints[0]);
  }, [fields?.id]);

  return (
    <>
      <main className="max-h-dvh overscroll-none">
        <Carousel.Host>
          <Carousel.Item className="min-w-full">
            <article className="content-grid">
              <h1 className="my-4 highlighter text-center font-serif text-4xl">
                Glam book
              </h1>

              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-min justify-self-center"
              />
            </article>
          </Carousel.Item>

          <Carousel.Item className="min-w-full" aria-hidden="false">
            <section className="max-h-svh overflow-hidden">
              <Timeline
                className="flex-1 relative bg-card border h-svh"
                currentDate={date}
                cards={recordList}
              />
            </section>

            <Drawer
              open={isCardSelected}
              onClose={records.finishEdit}
              noBodyStyles
              modal={false}
              snapPoints={snapPoints}
              activeSnapPoint={snap}
              setActiveSnapPoint={setSnap}
            >
              <DrawerContent className="h-[80svh]">
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
                      {serviceList &&
                        Array.from(serviceList, ([, v]) => (
                          <Toggle variant="outline" key={v.id}>{v.title}</Toggle>
                        ))}

                      <label>
                        <span>services:</span>

                        <Button
                          onClick={() => setEditServiceModalOpen(prev => !prev)}
                          type="button"
                        >
                          ADD +
                        </Button>
                      </label>

                      <Textarea
                        id=""
                        name=""
                        defaultValue={fields?.sign}
                        onBlur={e => {
                          records.store.editableRightNow.setState({
                            fields: {
                              ...fields!,
                              sign: e.currentTarget.value,
                            },
                          });
                        }}
                      />
                    </form>
                  </section>
                </div>
              </DrawerContent>
            </Drawer>

            <services.components.EditService
              open={editServiceModalIsOpen}
              onClose={() => setEditServiceModalOpen(false)}
            />
          </Carousel.Item>
        </Carousel.Host>
      </main>
    </>
  );
}
