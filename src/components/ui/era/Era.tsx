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
  getMonth,
  isEqual,
  addHours,
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
  useRef,
} from 'react';
import { Check, Copy, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
} from '@/components/ui/context-menu';
import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import { records, owner } from '@/shrekServices';

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
    onCopyFromTheDate,
    chosenDates,
    ...props
  }: {
    onSelect: (date: Date) => void;
    selected: Date;
    date: Date;
    visibleDate: Date;
    onCopyFromTheDate?: (date: Date) => void;
    Detail?: (props: { epoch: Date; currentDate: Date }) => React.ReactNode;
    chosenDates?: Set<number>;
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

    const { isOwner } = owner.useIsOwner();

    return (
      <table
        aria-label={`${format(date, 'yyyy MMMM')}`}
        className={cn('relative max-w-dvw flex flex-col', className)}
        {...props}
      >
        <thead className="flex w-full absolute translate-y-[-1lh] text-xl">
          <tr className="flex-1 h-[1lh] flex [&>*]:flex-1">
            <td className="flex items-center">
              <span className="w-max capitalize indent-3">
                {format(date, `LLLL ${getMonth(date) === 0 ? 'yyyy' : ''}`, {
                  locale: ru,
                })}
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
                      className="min-h-[5lh] text-xs overflow-hidden border-y border-x-transparent"
                      key={ddindex}
                      data-today={dd && isToday(dd)}
                    >
                      {dd && (
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <button
                              onClick={() => onSelect(dd)}
                              type="button"
                              className={cn(
                                'isolate relative w-full h-full pt-1 flex justify-center select-none',
                              )}
                            >
                              <span className="flex-1 max-w-full p-1 flex flex-col gap-1 items-center">
                                <Badge
                                  className={cn(
                                    'size-[4ch] rounded-full border-none text-xs',
                                    isToday(dd) &&
                                      'bg-red-600/80 font-semibold text-background-light',
                                  )}
                                  variant={isToday(dd) ? 'default' : 'outline'}
                                >
                                  {getDate(dd)}
                                </Badge>

                                {chosenDates?.has(dd.getTime()) && (
                                  <span className="absolute left-1 top-1.5 flex items-center justify-center bg-green-600 size-4 rounded-full text-white">
                                    <Check strokeWidth={3} className="size-3" />
                                  </span>
                                )}

                                <span className="empty:hidden w-full flex-1">
                                  {Detail && (
                                    <Detail
                                      epoch={dd}
                                      currentDate={visibleDate}
                                    />
                                  )}
                                </span>
                              </span>
                            </button>
                          </ContextMenuTrigger>
                          {isOwner && (
                            <ContextMenuPortal>
                              <ContextMenuContent collisionPadding={100}>
                                <ContextMenuItem
                                  onClick={() => {
                                    onCopyFromTheDate?.(dd);
                                  }}
                                >
                                  <Copy /> Скопировать расписание дня
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenuPortal>
                          )}
                        </ContextMenu>
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
  onSelect: _onSelect,
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

  const [months, setMonths] = useState(makeNMonths(startOfMonth(selected)));

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

  const [choosingState, setChoosingState] = useState(false);
  const dateToCopy = useRef<Date | undefined>(undefined);

  const [chosenDatesByMonth, setChosenDateByMonth] = useState<
    Map<number, Set<number>>
  >(new Map());

  const resetCopyState = () => {
    setChoosingState(false);
    dateToCopy.current = undefined;
    setChosenDateByMonth(new Map());
  };

  useEffect(() => {
    console.log([...chosenDatesByMonth.entries()]);
  }, [chosenDatesByMonth]);

  const onSelect = useCallback(
    (date: Date) => {
      if (dateToCopy.current) {
        if (isEqual(dateToCopy.current, date)) return;
        setChosenDateByMonth(prev => {
          const key = startOfMonth(date).getTime();
          const month = prev.get(key) ?? new Set();
          prev.set(key, month.symmetricDifference(new Set([date.getTime()])));
          return new Map(Array.from(prev));
        });
      } else _onSelect(date);
    },
    [_onSelect],
  );

  const onCopyFromTheDate = useCallback((date: Date) => {
    setChoosingState(true);
    dateToCopy.current = date;
  }, []);

  const {
    data: recordListToCopy = import.meta.env.DEV
      ? new Map([
          [
            0,
            {
              id: 0,
              from: new Date(),
              to: addHours(new Date(), 1),
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
        ])
      : undefined,
  } = records.useGet(owner.store.getState().calendarId, dateToCopy.current);

  return (
    <>
      <div className={cn('relative flex flex-col overflow-hidden', className)}>
        <div className="flex flex-col">
          <header className="flex justify-between py-2 pr-2">
            <h2 className="flex items-center text-xl indent-3 uppercase">
              {format(visibleDate, 'LLLL yyyy', { locale: ru })}
            </h2>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                fashion="fancy"
                className="h-9 bg-red-600/80"
                aria-label="Сегодня!"
                onClick={() => {
                  setMonths(makeNMonths(startOfMonth(new Date())));
                  setIsTodayClicked(true);
                  requestAnimationFrame(scrollToToday);
                }}
              >
                Сегодня
              </Button>
            </div>
          </header>

          <ul className="flex justify-around rounded-t-md text-xs lowercase border-b">
            <li>П</li>
            <li>В</li>
            <li>С</li>
            <li>Ч</li>
            <li>П</li>
            <li>С</li>
            <li>В</li>
          </ul>
        </div>

        <div
          ref={setScrollView}
          {...props}
          className={cn('overflow-y-auto scrollbar-hidden flex-1 rounded-md')}
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
                onCopyFromTheDate={onCopyFromTheDate}
                chosenDates={chosenDatesByMonth.get(startOfMonth(v).getTime())}
              />
            </IntersectionTarget>
          ))}
        </div>
      </div>

      {choosingState && (
        <div className="fixed top-unified-safe px-(--gap) py-1 w-full flex card items-center gap-x-1 bg-none backdrop-blur">
          <p>Выберите дни в календаре</p>
          <span className="font-mono">
            {Array.from(chosenDatesByMonth).reduce(
              (acc, [, month]) => month.size + acc,
              0,
            )}
          </span>
          <div className="ml-auto flex gap-x-1">
            <Button
              className="bg-success"
              fashion="glassy"
              onClick={() => {
                records
                  .copyTheDailySchedule({
                    source: Array.from(
                      recordListToCopy ?? new Map(),
                      ([, record]) => record,
                    ),
                    targets: [...chosenDatesByMonth.values()].reduce(
                      (acc, dateSet) => [
                        ...acc,
                        ...Array.from(
                          dateSet,
                          timestamp => new Date(timestamp),
                        ),
                      ],
                      [] as Date[],
                    ),
                  })
                  .then(console.log);

                resetCopyState();
              }}
            >
              OK
            </Button>
            <Button
              onClick={resetCopyState}
              className="size-10"
              fashion="glassy"
              size="icon"
            >
              <X />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
