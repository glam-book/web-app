import {
  useImperativeHandle,
  createContext,
  useContext,
  Children,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

export type HostApi = {
  next: (idx: number) => void;
};

type HostProps = React.HTMLAttributes<HTMLDivElement> & {
  ref: React.Ref<HostApi>;
  asChild?: boolean;
};

type Context = {
  itemsAmount: number;
  setItemsAmount: (n: number) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  scrollView: HTMLDivElement;
  setScrollView: (element: HTMLDivElement) => void;
};

export const CarouselContext = createContext<Partial<Context>>({});

const getcurrentindex = (target: HTMLElement) => {
  const { index: visibleChildrenIndex } = Array.from(target.children).reduce<{
    index: number;
    left: number;
  }>(
    (acc, i, index) => {
      const rect = i.getBoundingClientRect();
      const positiveLeft = Math.abs(rect.left);
      const isElementToTheLeft = positiveLeft < acc.left;
      const result = isElementToTheLeft ? { index, left: positiveLeft } : acc;

      return result;
    },
    { index: 0, left: Infinity },
  );

  return visibleChildrenIndex;
};

export const ItemsContainer = ({
  className,
  children,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
}) => {
  const Comp = asChild ? Slot : 'div';
  const carouselContext = useContext(CarouselContext);

  useEffect(() => {
    carouselContext.setItemsAmount?.(Children.count(children));
  }, [children, carouselContext]);

  return (
    <Comp
      {...props}
      ref={carouselContext.setScrollView}
      className={cn('overflow-x-auto flex snap-mandatory snap-x', className)}
    >
      {children}
    </Comp>
  );
};

export const Host = ({ ref, children, asChild, ...props }: HostProps) => {
  const Comp = asChild ? Slot : 'div';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsAmount, setItemsAmount] = useState(0);
  const [scrollView, setScrollView] = useState<HTMLDivElement>();

  useImperativeHandle(
    ref,
    () => ({
      next: (idx: number) => {
        const host = scrollView;
        if (!host) return;
        const rect = host.getBoundingClientRect();
        host.scroll({
          left: rect.width * idx,
          top: 0,
          behavior: 'smooth',
        });
      },
    }),
    [scrollView],
  );

  const contextValue = useMemo<React.ContextType<typeof CarouselContext>>(
    () => ({
      itemsAmount,
      setItemsAmount,
      currentIndex,
      setCurrentIndex,
      scrollView,
      setScrollView,
    }),
    [currentIndex, itemsAmount, scrollView],
  );

  return (
    <Comp {...props}>
      <CarouselContext.Provider value={contextValue}>
        {children}
      </CarouselContext.Provider>
    </Comp>
  );
};

export const Indicator = () => {
  const carouselContext = useContext(CarouselContext);
  const [isScrolling, setScrolling] = useState(false);

  useEffect(() => {
    const host = carouselContext.scrollView;
    if (!host) return;

    const handler = () => {
      carouselContext.setCurrentIndex?.(getcurrentindex(host));
      setScrolling(false);
    };

    host.addEventListener('scrollend', handler);

    return () => host.removeEventListener('scrollend', handler);
  }, [carouselContext]);

  const [isScrollToTheLeft, setScrollToTheLeft] = useState(false);

  useEffect(() => {
    const { scrollView: host } = carouselContext;
    if (!host) return;

    let aid = 0;
    let startLeft = host.scrollLeft;

    const handler = () => {
      cancelAnimationFrame(aid);
      aid = requestAnimationFrame(() => {
        setScrolling(true);
        const isScrollToTheLeftNew = host.scrollLeft < startLeft;
        setScrollToTheLeft(isScrollToTheLeftNew);
      });
    };

    host.addEventListener('scroll', handler);

    return () => host.removeEventListener('scroll', handler);
  }, [carouselContext]);

  return (
    <div className="w-fit rounded-4xl py-2 px-3 bg-background-darker/90 backdrop-blur-3xl border-t border-highlight">
      <ul className="flex gap-2">
        {Array.from({ length: carouselContext.itemsAmount ?? 0 }, (_, idx) => (
          <li
            key={idx}
            className={cn(
              'relative rounded-full h-2 aspect-square bg-foreground/20',
            )}
          >
            {idx === 0 && (
              <span
                style={{
                  left: `max(0px, calc(var(--spacing) * 4 * ${carouselContext.currentIndex ?? 0} - (${Number(isScrolling && isScrollToTheLeft)} * var(--spacing) * 4)))`,
                }}
                className={cn(
                  'absolute top-0 z-1 left-0 h-full w-full flex content-between items-center bg-muted-foreground transition-all rounded-full',
                  isScrolling && 'w-[calc(200%+var(--spacing)*2)]',
                )}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
