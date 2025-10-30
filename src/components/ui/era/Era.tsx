import {
  memo,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
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

import { IntersectionTarget } from '@/components/ui/intersectionTarget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// fuck
const isSafari = () =>
  navigator.userAgent.indexOf('Safari') > -1 &&
  navigator.userAgent.indexOf('Chrome') === -1;

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
        className={cn('h-full flex flex-col', className)}
        {...props}
      >
        <thead className="sticky top-0 z-2 bg-blurable backdrop-blur-3xl">
          <tr>
            <td className="text-2xl font-serif">
              {format(date, 'LLLL yyyy', { locale: ru })}
            </td>
          </tr>
        </thead>

        <tbody className="flex-1 flex flex-col [&>*]:flex-1">
          {daysGroupedByWeek.map((d, idx) => (
            <tr key={idx} className="text-center flex [&>*]:flex-1 snap-start">
              {d.map((dd, ddindex) => (
                <td className="font-mono text-sm" key={ddindex}>
                  {dd && (
                    <button
                      onClick={() => onSelect(dd)}
                      type="button"
                      className={cn(
                        'w-full h-full flex justify-center border-t',
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
      threshold: [0.55],
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

  const cb = useCallback((e: IntersectionObserverEntry) => {
    if (!e.isIntersecting) return;

    const target = e.target as HTMLElement;
    const date = new Date(
      Number(target.querySelector<HTMLElement>('[data-date]')?.dataset.date),
    );

    if (!isValid(date)) return;
  }, []);

  useLayoutEffect(() => {
    if (!isSafari()) return;
    requestAnimationFrame(scrollToCenter);
  }, [months]);

  return (
    <>
      <div className={cn('relative h-full overflow-hidden', className)}>
        <div
          ref={setScrollView}
          {...props}
          className={cn('overflow-y-auto h-full')}
          onScrollEnd={e => {
            if (!isSafari()) return;
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
            if (isSafari()) return;
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

        <div className="absolute top-[1lh] w-full z-1 text-2xl text-center flex justify-around bg-blurable backdrop-blur-3xl [&>*]:lowercase border-b pointer-events-none [&>*]:text-base">
          <div>ПН</div>
          <div>ВТ</div>
          <div>СР</div>
          <div>ЧТ</div>
          <div>ПТ</div>
          <div>СБ</div>
          <div>ВС</div>
        </div>
      </div>

      <Button
        type="button"
        variant="destructive"
        onClick={() => {
          setMonths(makeNMonths(new Date()));
          scrollToCenter();
        }}
      >
        TODAY
      </Button>
    </>
  );
};
