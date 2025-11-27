import { shareURL } from '@tma.js/sdk-react';
import { differenceInMonths, getDate, startOfMonth } from 'date-fns';
import { Share } from 'lucide-react';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { HostApi } from '@/components/ui/carousel';
import * as Carousel from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Era } from '@/components/ui/era';
import { Toaster } from '@/components/ui/sonner';
import { Timeline } from '@/components/ui/timeline';
import { cn } from '@/lib/utils';
import { useParams } from '@/router';
import { owner, records, services } from '@/shrekServices';
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
                'min-h-[0.5lh] h-[0.5lh] bg-card',
                item.hasPendings && 'bg-teal-200',
              )}
            />
          ))}
      </span>
    );
  },
);

function ProfilePreview({ profile, loading }: { profile?: Record<string, unknown> | undefined; loading?: boolean }) {
  // profile is a loosely-typed object coming from the server; handle defensively
  const initials = profile
    ? ((profile.name || profile.login || '') + ' ' + (profile.lastName || '')).trim()
        .split(' ')
        .map((s: string) => s[0])
        .join('')
        .slice(0, 2)
    : '';

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-muted-foreground/40 animate-pulse" />
        ) : profile?.profileIcon ? (
          <img src={String(profile.profileIcon)} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-muted-foreground">
            {initials || 'U'}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-semibold leading-none">
          {loading ? '...' : profile ? `${profile.name ?? profile.login ?? 'User'}` : '—'}
        </div>

        {/* small details clickable - open dialog to see contacts */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-xs text-muted-foreground opacity-80 hover:opacity-100">See contacts</button>
          </DialogTrigger>

          <DialogContent>
            <DialogTitle>Contacts</DialogTitle>
            <DialogDescription>
              {Array.isArray(profile?.contacts) && (profile.contacts as unknown[]).length ? (
                <ul className="mt-2 space-y-2">
                  {Array.isArray(profile.contacts)
                    ? (profile.contacts as unknown[]).map((c, idx) => (
                    <li key={idx} className="text-sm">
                      {typeof c === 'object' ? JSON.stringify(c) : String(c)}
                    </li>
                  ))
                    : null}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">No contacts</div>
              )}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

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

  useEffect(() => {
    return () => carouselApi.current?.next(1);
  }, [date]);

  const { isOwner } = owner.useIsOwner();

  return (
    <main className="flex flex-col gap-0.5 max-h-dvh overscroll-none">
      <header className="flex justify-between items-center gap-2">
        {/* compact profile area */}
        <div
          className={cn(
            'flex-1 flex items-center gap-2 font-serif text-sm indent-2',
            isOwner && 'bg-card',
          )}
        >
          {/* profile fetch: me or user by id */}
          {(() => {
            const { data: profile, isLoading } = owner.useProfile();

            return (
              <div className="flex items-center gap-2">
                <ProfilePreview profile={profile as Record<string, unknown> | undefined} loading={isLoading} />
              </div>
            );
          })()}
        </div>

        <Button
          aria-label="Share"
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => {
            const startAppParam = { calendarId: params.id };
            shareURL(
              `https://t.me/glambookbot/slapdash?startapp=${btoa(JSON.stringify(startAppParam))}`,
            );
          }}
        >
          <Share />
        </Button>
      </header>

      <Carousel.Host className="flex-1 overflow-y-hidden" ref={carouselApi}>
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
              className="flex-1 relative bg-card border h-svh"
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

      <Toaster />
    </main>
  );
}
