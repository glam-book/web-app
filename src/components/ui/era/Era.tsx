import { memo, useMemo, useState, useCallback, useEffect } from 'react';
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
import { cn } from '@/lib/utils';

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
                  <button
                    onClick={dd ? () => onSelect(dd) : undefined}
                    type="button"
                    className={cn(
                      'w-full h-full flex justify-center border-t active:bg-card',
                      dd &&
                        isEqual(startOfDay(dd), startOfDay(selected)) &&
                        'bg-card',
                    )}
                  >
                    {dd ? getDate(dd) : ''}
                  </button>
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
      rootMargin: '50%',
      threshold: 1,
    }),
    [scrollView],
  );

  const [center, setCenter] = useState(selected);

  const n = 9;
  const nMonths = useMemo(() => {
    const res = Array.from({ length: n }, (_, idx) =>
      addMonths(center, idx - Math.floor(n / 2)),
    );
    return res;
  }, [center]);

  useEffect(() => {
    if (!scrollView) return;
    const rect = scrollView.getBoundingClientRect();
    scrollView.scroll(0, rect.height * Math.floor(n / 2));
  }, [scrollView]);

  const cb = useCallback((e: IntersectionObserverEntry) => {
    console.log({ e });
    if (!e.isIntersecting) return;

    const target = e.target as HTMLElement;
    const date = new Date(
      Number(target.querySelector<HTMLElement>('[data-date]')?.dataset.date),
    );

    if (!isValid(date)) return;

    setCenter(date);
  }, []);

  return (
    <>
      <div className={cn('relative h-full overflow-hidden', className)}>
        <div
          ref={setScrollView}
          {...props}
          className={cn('overflow-y-auto h-full')}
        >
          <div className="h-full">
            {nMonths.map(v => (
              <IntersectionTarget
                key={v.getTime()}
                className="h-full"
                intersectionOpts={intersectionObserverOpts}
                callback={cb}
              >
                <Month
                  selected={selected}
                  onSelect={onSelect}
                  data-date={v.getTime()}
                  date={v}
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
    </>
  );
};
