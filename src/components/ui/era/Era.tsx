import {
  memo,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react';
import {
  format,
  getDay,
  getDate,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getWeekOfMonth,
  addMonths,
  isValid,
  startOfDay,
  isEqual,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// fuck
const isSafari = () =>
  navigator.userAgent.indexOf('Safari') > -1 &&
  navigator.userAgent.indexOf('Chrome') === -1;

const isTgSafari = () => {
  const platform = retrieveLaunchParams().tgWebAppPlatform;
  return platform === 'ios' || platform === 'macos';
};

const isFinallySafari = () => isSafari() || isTgSafari();

const Month = memo(
  ({
    onSelect,
    selected,
    date,
    className,
    ...props
  }: {
    onSelect: (date: Date) => void;
    selected: Date;
    date: Date;
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
        className={cn('relative h-full flex flex-col', className)}
        {...props}
      >
        <thead className="absolute translate-y-[-1lh] text-2xl bg-blurable backdrop-blur-3xl">
          <tr>
            <td className="font-serif indent-3">
              <span>{format(date, 'LLLL yyyy', { locale: ru })}</span>
            </td>
          </tr>
        </thead>

        <tbody className="flex-1 flex flex-col [&>*]:flex-1 text-2xl pb-[1lh]">
          {daysGroupedByWeek.map((d, idx) => (
            <tr key={idx} className="text-center flex [&>*]:flex-1 snap-start">
              {d.map((dd, ddindex) => (
                <td className="font-mono text-sm" key={ddindex}>
                  {dd && (
                    <button
                      onClick={() => onSelect(dd)}
                      type="button"
                      className={cn(
                        'w-full h-full pt-1 flex justify-center border-t',
                        isEqual(startOfDay(dd), startOfDay(selected)) &&
                          'bg-card',
                      )}
                    >
                      <Badge
                        variant={
                          isEqual(startOfDay(dd), startOfDay(new Date()))
                            ? 'destructive'
                            : 'outline'
                        }
                        className="h-min rounded-2xl border-none"
                      >
                        {getDate(dd)}
                      </Badge>
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
} & Omit<React.ComponentProps<'div'>, 'onSelect'>;

export const Era = ({
  onSelect,
  selected = new Date(),
  className,
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

  const n = Math.max(29, 9);

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
          <h2 className="font-serif text-2xl indent-3">
            {format(visibleDate, 'LLLL yyyy', { locale: ru })}
          </h2>

          <Button
            type="button"
            size="sm"
            variant="destructive"
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
                date={v}
                data-date={v.getTime()}
              />
            </IntersectionTarget>
          ))}
        </div>
      </div>
    </div>
  );
};
