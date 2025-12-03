import { shareURL } from '@tma.js/sdk-react';
import { Share } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { HostApi } from '@/components/ui/carousel';
import * as Carousel from '@/components/ui/carousel';

import { Era } from '@/components/ui/era';
import { Toaster } from '@/components/ui/sonner';
import { Timeline } from '@/components/ui/timeline';
import { cn } from '@/lib/utils';
import { useParams } from '@/router';
import { owner, records, services } from '@/shrekServices';
import ProfilePreview from '@/shrekServices/components/ProfilePreview';

export default function Id() {
  const params = useParams('/calendar/:id');

  useEffect(() => {
    owner.store.setState({ calendarId: params.id });
  }, [params.id]);

  const [date, setDate] = useState(new Date());

  const { data: recordList, error: errorRecordList } = records.useGet(
    params.id,
    date,
  );

  // useEffect(() => {
  //   if (errorRecordList) {
  //     toast.error(JSON.stringify(errorRecordList));
  //   }
  // }, [errorRecordList]);

  const { fields: recordFields } = records.store.editableRightNow();
  const isCardSelected = Boolean(recordFields);

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

  const { isOwner } = owner.useIsOwner();

  return (
    <main className="h-dvh p-1">
      <div className="flex flex-col gap-0.5 max-h-full overscroll-none">
        <header className="font-mono text-2xl pt-2 pb-2 rounded-sm flex justify-between items-center">
          <div
            className={cn(
              'flex-1 items-center gap-2 text-sm indent-2 rounded-3xl',
              isOwner && 'bg-secondary',
            )}
          >
            {(() => {
              const { data: profile, isLoading } = owner.useProfile();
              const hasPersonalFields = (
                p: unknown,
              ): p is {
                name?: string | null;
                lastName?: string | null;
                login?: string | null;
              } =>
                typeof p === 'object' &&
                p !== null &&
                ('name' in p || 'lastName' in p || 'login' in p);
              const displayFullName = hasPersonalFields(profile)
                ? `${String(profile.name ?? '')} ${String(profile.lastName ?? '')}`.trim()
                : '';

              const displayLogin = hasPersonalFields(profile)
                ? String(profile.login ?? '')
                : '';
              return (
                <div className="flex items-center gap-2 text-sm font-bold indent-2 text-white">
                  <ProfilePreview profile={profile} loading={isLoading} />
                  {displayFullName}
                  <div>{displayLogin}</div>
                </div>
              );
            })()}
          </div>
          <Button
            aria-label="Share"
            type="button"
            variant="ghost"
            size="icon"
            className="min-w-[2.5lh] !size-12"
            onClick={() => {
              const startAppParam = { calendarId: params.id };
              shareURL(
                `https://t.me/glambookbot/slapdash?startapp=${btoa(JSON.stringify(startAppParam))}`,
              );
            }}
          >
            <Share className="size-6" />
          </Button>
        </header>

        <Carousel.Host className="flex-1 overflow-y-hidden" ref={carouselApi}>
          <Carousel.Item className="flex-1 min-w-full flex">
            <article className="flex-1 flex flex-col">
              <Era
                onSelect={setDate}
                selected={date}
                className="without-gap border border-test"
                Detail={records.components.RecordPreview}
              />
            </article>
          </Carousel.Item>

          <Carousel.Item className="flex-1 min-w-full">
            <section className="max-h-svh overflow-hidden">
              <Timeline
                className="flex-1 rounded-sm relative bg-card h-svh"
                currentDate={date}
                cards={recordList}
              />
            </section>

            <records.EditRecordModal />

            <services.components.EditService />
          </Carousel.Item>
        </Carousel.Host>

        <footer className="pb-[calc(env(safe-area-inset-bottom)+0.2em)] indent-3">
          FOOTER::::MUTTER
        </footer>
      </div>

      <Toaster />
    </main>
  );
}
