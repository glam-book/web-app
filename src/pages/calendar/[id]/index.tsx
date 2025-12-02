import { shareURL } from '@tma.js/sdk-react';
import { differenceInMonths, getDate, startOfMonth } from 'date-fns';
import { ChevronLeft, Share } from 'lucide-react';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { between } from '@/utils';

export const Detail = memo(
  ({ epoch, currentDate }: { epoch: Date; currentDate: Date }) => {
    const [shouldGetPreview, setShouldGetPreview] = useState(false);

    useEffect(() => {
      setShouldGetPreview(prev => {
        if (prev) return prev;

        return between(
          differenceInMonths(startOfMonth(epoch), startOfMonth(currentDate)),
          -1,
          1,
        );
      });
    }, [epoch, currentDate]);

    const { calendarId } = owner.store.getState();
    const { isOwner } = owner.useIsOwner();
    const { data: details } = records.useGetPreview(
      shouldGetPreview ? calendarId : undefined,
      startOfMonth(epoch),
    );

    const detailsForTheDay = details?.[getDate(epoch)];
    const isPreviewForClient =
      !isOwner && detailsForTheDay?.some(i => i.canPending);

    const hostRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
      const host = hostRef.current;
      let timerId = 0;
      if (host) {
        host.style.display = 'none';
        timerId = requestAnimationFrame(() => {
          host.style.display = '';
        });
      }
      return () => cancelAnimationFrame(timerId);
    }, [details]);

    return (
      <span
        ref={hostRef}
        className={cn(
          'min-w-0.5 min-h-full h-full grid auto-rows-min gap-0.5',
          isPreviewForClient && 'absolute z-[-1] inset-0 bg-teal-200/50',
        )}
      >
        {isOwner &&
          detailsForTheDay?.map((item, idx) => (
            <span
              key={idx}
              className={cn(
                'min-h-[0.8lh] h-[0.5lh] bg-card rounded-sm',
                item.hasPendings && 'bg-teal-200',
              )}
            />
          ))}
      </span>
    );
  },
);

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

  useEffect(() => {
    if (errorRecordList) {
      toast.error(JSON.stringify(errorRecordList));
    }
  }, [errorRecordList]);

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
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  const onHostScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const host = e.currentTarget;
    const rect = host.getBoundingClientRect();
    const idx = Math.round(host.scrollLeft / rect.width);
    setCarouselIndex(idx);
  };

  useEffect(() => {
    return () => carouselApi.current?.next(1);
  }, [date]);

  const { isOwner } = owner.useIsOwner();

  return (
    <main className="flex flex-col gap-0.5 max-h-dvh overscroll-none pl-2 pr-2">
      <header className="pt-2 pb-2 rounded-sm flex justify-between items-center">
        {/* compact profile area */}
        <div
          className={cn(
            'flex-1 items-center gap-2 text-sm indent-2 rounded-3xl',
            isOwner && 'bg-secondary',
          )}
        >
          {/* profile fetch: me or user by id */}
          {(() => {

            const { data: profile, isLoading } = owner.useProfile();
            const hasPersonalFields = (p: unknown): p is { name?: string | null; lastName?: string | null; login?: string | null } =>
              typeof p === 'object' && p !== null && ('name' in p || 'lastName' in p || 'login' in p);
            const displayFullName = hasPersonalFields(profile)
              ? `${String(profile.name ?? '')} ${String(profile.lastName ?? '')}`.trim()
              : '';

            const displayLogin = hasPersonalFields(profile) ? String(profile.login ?? '') : '';
            return (
              <div
                className={cn(
                  'flex items-center gap-2 text-sm font-bold indent-2 text-white',
                  carouselIndex === 1 && 'has-back',
                )}
              >
                  {carouselIndex === 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Back to calendar"
                    onClick={() => carouselApi.current?.next(0)}
                    className="min-w-[2.5lh] animate-wobble-in origin-left"
                  >
                    <ChevronLeft className="size-6 text-white" />
                  </Button>
                )}

                <span className="followable animate-follow">
                  <ProfilePreview profile={profile} loading={isLoading} />
                </span>

                {displayFullName ? (
                  <span
                    className="followable animate-follow"
                    style={{ transitionDelay: '120ms', animationDelay: '120ms' }}
                  >
                    {displayFullName}
                  </span>
                ) : null}

                <div
                  className="followable animate-follow"
                  style={{ transitionDelay: '160ms', animationDelay: '160ms' }}
                >
                  {displayLogin}
                </div>
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

      <Carousel.Host
        className="flex-1 overflow-y-hidden rounded-sm"
        ref={carouselApi}
        onScroll={onHostScroll}
      >
        <Carousel.Item className="flex-1 min-w-full flex">
          <article className="flex-1 flex flex-col">
            <div className="overflow-hidden">
              <Era
                onSelect={setDate}
                selected={date}
                className="without-gap"
                Detail={Detail}
              />
            </div>
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
        OPEN BETTA
      </footer>

      <Toaster />
    </main>
  );
}
