import { shareURL } from '@tma.js/sdk-react';
import { Share } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { addHours } from 'date-fns';

import { version } from 'root/package.json';
import type { HostApi } from '@/components/ui/carousel';
import * as Carousel from '@/components/ui/carousel';
import { Record } from '@/schemas/Record';

import { Era } from '@/components/ui/era';
import { Toaster } from '@/components/ui/sonner';
import { Timeline } from '@/components/ui/timeline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useParams } from '@/router';
import { owner, records, services, users } from '@/shrekServices';

export default function Id() {
  const params = useParams('/calendar/:id');
  const ownerResult = owner.useIsOwner();

  useEffect(() => {
    owner.store.setState({ calendarId: params.id });
  }, [params.id]);

  const [date, setDate] = useState(new Date());

  const {
    data: recordList = new Map<number, typeof Record.Type>([
      [
        0,
        {
          id: 0,
          from: addHours(new Date(), 9),
          to: addHours(new Date(), 10),
          serviceIdList: new Set([1, 2, 3]),
          sign: '',
          owner: false,
          pendigable: true,
          pendings: {
            limits: 1,
            active: 1,
          },
        },
      ],
    ]),
    error: errorRecordList,
  } = records.useGet(params.id, date);

  const readyRecordList = useMemo(
    () =>
      new Map(
        Array.from(recordList).filter(
          ([, record]) => ownerResult.isOwner || record.pendigable,
        ),
      ),
    [recordList, ownerResult.isOwner],
  );

  const { fields: recordFields } = records.store.editableRightNow();
  const isCardSelected = Boolean(recordFields);

  // useEffect(() => {
  //   if (errorRecordList) {
  //     toast.error(JSON.stringify(errorRecordList));
  //   }
  // }, [errorRecordList]);

  useEffect(() => {
    let afid: number;

    if (isCardSelected) {
      afid = requestAnimationFrame(() => {
        document.body.style.pointerEvents = '';
      });
    }

    return () => cancelAnimationFrame(afid);
  }, [isCardSelected]);

  const carouselApi = useRef<HostApi>(null);

  useEffect(() => {
    return () => carouselApi.current?.next(1);
  }, [date]);

  const [carouselIndicatorWrapper, setCarouselIndicatorWrapper] =
    useState<HTMLElement | null>(null);

  return (
    <>
      <main className="content-grid pt-unified-safe grid-rows-[1fr_auto_1fr] max-h-dvh overscroll-none">
        <header
          ref={() => {}}
          className="breakout flex justify-between items-center rounded-sm"
        >
          <div className={cn('py-1 items-center rounded-3xl')}>
            <users.components.ProfileView />
          </div>

          <Button
            aria-label="Share"
            type="button"
            fashion="glassy"
            size="icon"
            className="rounded-full size-10"
            onClick={() => {
              const startAppParam = { calendarId: params.id };
              const url = `https://t.me/glambookbot/slapdash?startapp=${btoa(JSON.stringify(startAppParam))}`;
              shareURL(url);
            }}
          >
            <Share />
          </Button>
        </header>

        <Carousel.Host
          className="full-bleed max-h-full overflow-y-hidden"
          ref={carouselApi}
        >
          <Carousel.ItemsContainer className="max-h-full scrollbar-hidden overscroll-none">
            <Carousel.Item className="flex-1 min-w-full flex">
              <article className="flex-1 content-grid">
                <Era
                  onSelect={setDate}
                  selected={date}
                  className="breakout card rounded-b-none shadow-none"
                  Detail={records.components.RecordPreview}
                />
              </article>
            </Carousel.Item>

            <Carousel.Item className="flex-1 min-w-full max-w-full flex">
              <section className="flex-1 flex overflow-hidden">
                <Timeline
                  className="flex-1"
                  currentDate={date}
                  cards={readyRecordList}
                />
              </section>

              <records.EditRecordModal />

              <services.components.EditService />
            </Carousel.Item>
          </Carousel.ItemsContainer>

          {carouselIndicatorWrapper &&
            createPortal(<Carousel.Indicator />, carouselIndicatorWrapper)}
        </Carousel.Host>

        <footer className="footer fixed bottom-0 w-full full-bleed content-grid pb-unified-safe px-unified-safe indent-3 backdrop-blur-xs">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            <span />
            <div ref={setCarouselIndicatorWrapper} />
            <span className="font-mono text-xs justify-self-end-safe">
              {version}
            </span>
          </div>
        </footer>
      </main>

      <Toaster />
    </>
  );
}
