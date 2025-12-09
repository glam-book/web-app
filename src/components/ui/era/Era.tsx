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
  startOfMonth,
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

    // Math.atan(1.75/6) * 180 / Math.PI
    // background-image: linear-gradient(164deg, transparent, transparent calc(50%), black, black 50%, transparent calc(50% + 1px));

    return (
      <table
        aria-label={`${format(date, 'yyyy MMMM')}`}
        className={cn('relative max-w-dvw flex flex-col', className)}
        {...props}
      >
        <thead className="flex w-full absolute translate-y-[-1lh] text-2xl">
          <tr className="flex-1 h-[1lh] flex [&>*]:flex-1">
            <td className="flex items-center">
              <span className="w-max bg-background uppercase indent-1">
                {format(date, 'LLLL yyyy', { locale: ru })}
              </span>
            </td>
          </tr>
        </thead>

        <tbody className="flex-1 flex flex-col [&>*]:flex-1 text-2xl pb-[1lh] [&>tr>td]:border-l [&>tr>td:last-child]:border-r [&>tr>td]:border-b [&>tr:has(+tr:last-child)>td]:border-b-0 [&>tr:last-child>td]:border-t [&>tr:first-child>td]:border-t [&>tr>td:first-child:empty]:after:block">
          {daysGroupedByWeek.map((d, idx) => (
            <tr
              key={idx}
              className="flex-1 grid grid-cols-7"
            >
              {d.map((dd, ddindex) => (
                <>
                  {!dd && ddindex === 0 && (
                    <td
                      style={{ gridColumn: `span ${d.findIndex(Boolean)}` }}
                      className="border-test"
                    />
                  )}
                  {dd && (
                    <td
                      className="aspect-[1/1.75] overflow-hidden border-test empty:after:w-full empty:after:h-full empty:after:bg-[tomato]"
                      key={ddindex}
                      data-today={
                        dd && isEqual(startOfDay(dd), startOfDay(new Date()))
                      }
                    >
                      {dd && (
                        <button
                          onClick={() => onSelect(dd)}
                          type="button"
                          className={cn(
                            'isolate relative w-full h-full pt-1 flex justify-center',
                            isEqual(startOfDay(dd), startOfDay(selected)) &&
                              'bg-muted',
                          )}
                        >
                          <span className="flex-1 max-w-full flex flex-col text-xs">
                            <Badge
                              className="h-min font-mono rounded-2xl border-none"
                              variant={
                                isEqual(startOfDay(dd), startOfDay(new Date()))
                                  ? 'default'
                                  : 'outline'
                              }
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
                  )}
                </>
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
        <header className="flex justify-between py-2 pr-1">
          <h2 className="text-2xl indent-3 uppercase">
            {format(visibleDate, 'LLLL yyyy', { locale: ru })}
          </h2>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setMonths(makeNMonths(new Date()));
              setIsTodayClicked(true);
              requestAnimationFrame(scrollToToday);
            }}
          >
            TODAY
          </Button>
        </header>

        <ul className="flex justify-around text-sm lowercase border-test border-b [&>li]:border-test [&>li]:border-l [&>li:last-child]:border-r [&>li]:flex-1 [&>li]:text-center">
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
