import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDate,
  getDay,
  getWeekOfMonth,
  isEqual,
  isValid,
  startOfDay,
  startOfMonth
} from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import { cn } from '@/lib/utils';

const isFinallySafari = () =>
  document.documentElement.style.overflowAnchor === undefined;

const Month = memo(
  ({
    onSelect,
    selected,
    date,
    visibleDate,
    className,
    Detail,
    ...props
  }: {
    onSelect: (date: Date) => void;
    selected: Date;
    date: Date;
    visibleDate: Date;
    Detail?: (props: { epoch: Date; currentDate: Date }) => React.ReactNode;
  } & Omit<React.ComponentProps<'table'>, 'onSelect'>) => {
    const d = eachDayOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date),
    });

    const daysGroupedByWeek = d.reduce(
      (acc, day) => {
        const i = getWeekOfMonth(day, { weekStartsOn: 1 });
        const j = (getDay(day) + 6) % 7;
        acc[i] ??= Array.from<undefined>({ length: 7 }).fill(undefined);
        acc[i][j] = day;
        return acc;
      },
      [] as (Date | undefined)[][],
    );

    return (
      <table
        aria-label={`${format(date, 'yyyy MMMM')}`}
        className={cn('relative max-w-dvw h-full flex flex-col', className)}
        {...props}
      >
        <thead className="absolute translate-y-[-1lh] text-2xl bg-blurable backdrop-blur-3xl rounded-t-sm pr-3 bg-muted">
          <tr>
            <td className="indent-3">
              <span>{format(date, 'LLLL yyyy', { locale: ru })}</span>
            </td>
          </tr>
        </thead>

        <tbody className="max-h-dvh min-h-1 flex-1 flex flex-col [&>*]:flex-1 text-2xl pb-[1lh]">
          {daysGroupedByWeek.map((d, idx) => (
            <tr
              key={idx}
              className="max-h-[calc(100dvh/5)] min-h-1 flex-1 text-center flex [&>*]:flex-1 snap-start"
            >
              {d.map((dd, ddindex) => (
                <td className="border-t h-full overflow-hidden" key={ddindex}>
                  {dd && (
                    <button
                      onClick={() => onSelect(dd)}
                      type="button"
                      className={cn(
                        'isolate relative w-full h-full pt-1 flex justify-center rounded-b-md',
                        isEqual(startOfDay(dd), startOfDay(selected)) &&
                          'bg-blurable backdrop-blur-3x bg-muted',
                      )}
                    >
                      <span className="flex-1 max-w-full flex flex-col text-sm">
                        <Badge
                          variant={
                            isEqual(startOfDay(dd), startOfDay(new Date()))
                              ? 'default'
                              : 'outline'
                          }
                          className="h-min self-center font-mono rounded-2xl border-none text-base"
                        >
                          {getDate(dd)}
                        </Badge>

                        <span className="empty:hidden w-full flex-1 p-0.5">
                          {Detail && (
                            <Detail epoch={dd} currentDate={visibleDate} />
                          )}
                        </span>
                      </span>
                    </button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
);

type Props = {
  onSelect: (date: Date) => void;
  selected?: Date;
  Detail?: (props: { epoch: Date; currentDate: Date }) => React.ReactNode;
  onChangeVisibleMonth?: (month: Date) => void;
} & Omit<React.ComponentProps<'div'>, 'onSelect'>;

export const Era = ({
  onSelect,
  selected = new Date(),
  className,
  onChangeVisibleMonth,
  Detail,
  ...props
}: Props) => {
  const [scrollView, setScrollView] = useState<HTMLDivElement | null>(null);

  const intersectionObserverOpts = useMemo(
    () => ({
      root: scrollView,
      threshold: [0.1, 0.8],
      rootMargin: '0px 0px 0px -80%',
    }),
    [scrollView],
  );

  const n = Math.max(16, 9);

  const makeNMonths = (center: Date) =>
    Array.from({ length: n }, (_, idx) =>
      addMonths(center, idx - Math.floor(n / 2)),
    );

  const [months, setMonths] = useState(makeNMonths(selected));

  const scrollToCenter = () => {
    if (!scrollView) return;
    const rect = scrollView.getBoundingClientRect();
    scrollView.scroll(0, rect.height * Math.floor(n / 2));
  };

  useEffect(() => {
    scrollToCenter();
  }, [scrollView]);

  const [visibleDate, setVisibleDate] = useState(selected);

  const cb = useCallback((e: IntersectionObserverEntry) => {
    if (!e.isIntersecting) return;

    const target = e.target as HTMLElement;
    const date = new Date(
      Number(target.querySelector<HTMLElement>('[data-date]')?.dataset.date),
    );

    if (!isValid(date)) return;

    setVisibleDate(date);
    onChangeVisibleMonth?.(date);
  }, []);

  useLayoutEffect(() => {
    if (!isFinallySafari()) return;
    requestAnimationFrame(scrollToCenter);
  }, [months]);

  return (
    <div
      className={cn('relative h-full flex flex-col overflow-hidden', className)}
    >
      <div className="flex flex-col border-b">
        <div className="flex justify-between pr-0.5">
          <h2 className="text-2xl indent-3">
            {format(visibleDate, 'LLLL yyyy', { locale: ru })}
          </h2>

          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={() => {
              setMonths(makeNMonths(new Date()));
              scrollToCenter();
            }}
          >
            TODAY
          </Button>
        </div>

        <ul className="flex justify-around text-sm lowercase">
          <li>ПН</li>
          <li>ВТ</li>
          <li>СР</li>
          <li>ЧТ</li>
          <li>ПТ</li>
          <li>СБ</li>
          <li>ВС</li>
        </ul>
      </div>

      <div
        ref={setScrollView}
        {...props}
        className={cn('overflow-y-auto flex-1')}
        onScrollEnd={e => {
          if (!isFinallySafari()) return;
          const target = e.currentTarget;
          const depth = target.scrollHeight - target.scrollTop;

          if (depth <= target.clientHeight) {
            setMonths(makeNMonths(months.at(-1) as Date));
          }

          if (target.scrollTop <= 0) {
            setMonths(makeNMonths(months[0]));
          }
        }}
        onScroll={e => {
          if (isFinallySafari()) return;
          const target = e.currentTarget;
          const depth = target.scrollHeight - target.scrollTop;

          if (depth <= target.clientHeight * 4) {
            setMonths(makeNMonths(months.at(-1) as Date));
          }

          if (target.scrollTop <= target.clientHeight * 4) {
            setMonths(makeNMonths(months[0]));
          }
        }}
      >
        <div className="h-full">
          {months.map(v => (
            <IntersectionTarget
              key={v.getTime()}
              className="h-full"
              intersectionOpts={intersectionObserverOpts}
              callback={cb}
            >
              <Month
                onSelect={onSelect}
                selected={selected}
                visibleDate={visibleDate}
                date={v}
                data-date={v.getTime()}
                Detail={Detail}
              />
            </IntersectionTarget>
          ))}
        </div>
      </div>
    </div>
  );
};
