import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDate,
  getDay,
  getWeekOfMonth,
  isValid,
  startOfMonth,
  isToday,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  Fragment,
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
        className={cn('relative max-w-dvw flex flex-col', className)}
        {...props}
      >
        <thead className="flex w-full absolute translate-y-[-1lh] text-2xl">
          <tr className="flex-1 h-[1lh] flex [&>*]:flex-1">
            <td className="flex items-center">
              <span className="w-max uppercase indent-3">
                {format(date, 'LLLL yyyy', { locale: ru })}
              </span>
            </td>
          </tr>
        </thead>

        <tbody className="flex-1 flex flex-col [&>*]:flex-1 text-2xl pb-[1lh] /*[&>tr>td]:border-l [&>tr>td:last-child]:border-r [&>tr>td]:border-b [&>tr:has(+tr:last-child)>td]:border-b-0 [&>tr:last-child>td]:border-t [&>tr:first-child>td]:border-t [&>tr:last-child>td]:border-b-transparent [&>tr>td]:border-0! [&>tr]:border-t */ [&_td]:rounded-md">
          {daysGroupedByWeek.map((d, idx) => (
            <tr key={idx} className="flex-1 grid grid-cols-7 gap-x-0.5 py-1">
              {d.map((dd, ddindex) => (
                <Fragment key={ddindex}>
                  {!dd && ddindex === 0 && (
                    <td
                      style={{ gridColumn: `span ${d.findIndex(Boolean)}` }}
                      className="border-y border-x-transparent"
                    />
                  )}
                  {!dd && ddindex === d.length - 1 && (
                    <td
                      style={{
                        gridColumn: `span ${d.reduce((acc, i) => acc + Number(!i), 0)} / -1`,
                      }}
                      className="border-y border-x-transparent"
                    />
                  )}
                  {dd && (
                    <td
                      className="aspect-[1/2] overflow-hidden border-y border-x-transparent text-xs"
                      key={ddindex}
                      data-today={dd && isToday(dd)}
                    >
                      {dd && (
                        <button
                          onClick={() => onSelect(dd)}
                          type="button"
                          className={cn(
                            'isolate relative w-full h-full pt-1 flex justify-center',
                          )}
                        >
                          <span className="flex-1 max-w-full p-1 flex flex-col gap-1 items-center">
                            <Badge
                              className={cn(
                                'h-min border-none',
                                isToday(dd) && 'bg-red-600/80',
                              )}
                              variant={isToday(dd) ? 'default' : 'outline'}
                            >
                              {getDate(dd)}
                            </Badge>

                            <span className="empty:hidden w-full flex-1 overflow-hidden">
                              {Detail && (
                                <Detail epoch={dd} currentDate={visibleDate} />
                              )}
                            </span>
                          </span>
                        </button>
                      )}
                    </td>
                  )}
                </Fragment>
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
  const [isTodayClicked, setIsTodayClicked] = useState(false);

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

  const scrollToToday = () => {
    if (!scrollView) return;
    const rect = scrollView.getBoundingClientRect();
    const today = scrollView.querySelector('[data-today="true"]');
    if (!today) return;
    const todayRect = today?.getBoundingClientRect();
    scrollView.scroll(
      0,
      scrollView.scrollTop - rect.top + todayRect.top - todayRect.height / 2,
    );
  };

  const scrollToCenter = () => {
    if (!scrollView) return;
    if (isTodayClicked) return;
    const isScrollToTheTop = scrollView.scrollTop === 0;
    const monthElems = Array.from(scrollView.querySelectorAll('table'));
    const firstHalf = monthElems.slice(0, Math.floor(n / 2));
    const secondHalf = monthElems.slice(Math.floor(n / 2));
    const rect = scrollView.getBoundingClientRect();

    const y = isScrollToTheTop
      ? firstHalf.reduce((sum, elem) => sum + elem.offsetHeight, 0)
      : scrollView.scrollHeight -
        secondHalf.reduce((sum, elem) => sum + elem.offsetHeight, 0) +
        Math.abs(secondHalf[0].offsetHeight - rect.height);

    scrollView.scrollTo(0, y);
  };

  useEffect(() => {
    scrollToToday();
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

  useLayoutEffect(() => {
    if (isTodayClicked) setIsTodayClicked(false);
  }, [isTodayClicked]);

  return (
    <div className={cn('relative flex flex-col overflow-hidden', className)}>
      <div className="flex flex-col">
        <header className="flex justify-between py-2">
          <h2 className="flex items-center text-2xl indent-3 uppercase">
            {format(visibleDate, 'LLLL yyyy', { locale: ru })}
          </h2>

          <Button
            type="button"
            size="sm"
            fashion="fancy"
            className="bg-red-600/80"
            onClick={() => {
              setMonths(makeNMonths(new Date()));
              setIsTodayClicked(true);
              requestAnimationFrame(scrollToToday);
            }}
          >
            Сегодня
          </Button>
        </header>

        <ul className="flex justify-around rounded-t-md text-sm lowercase border-transparent border-b [&>li]:border-y [&>li]:border-x-transparent [&>li]:border-l [&>li:last-child]:border-r [&>li]:flex-1 [&>li]:text-center">
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
        className={cn('overflow-y-auto flex-1 rounded-md')}
        onScrollEnd={e => {
          if (!isFinallySafari()) return;

          const target = e.currentTarget;
          const depth = target.scrollHeight - target.scrollTop;

          if (depth <= target.clientHeight + 1) {
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
        {months.map(v => (
          <IntersectionTarget
            key={v.getTime()}
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
  );
};
