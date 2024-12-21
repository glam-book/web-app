import { useEffect, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

type IntersectionTargetProps = React.HTMLAttributes<HTMLDivElement> & {
  intersectionOpts: IntersectionObserverInit;
  callback: (
    entry: IntersectionObserverEntry,
    observer: IntersectionObserver,
  ) => void;
  asChild?: boolean;
};

export const IntersectionTarget = ({
  children,
  callback,
  intersectionOpts,
  asChild = false,
  ...props
}: IntersectionTargetProps) => {
  const Comp = asChild ? Slot : 'div';
  const compRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    const currentCallback = callbackRef.current ?? (() => {});
    const target = compRef.current;
    const obs = new IntersectionObserver(
      (entries, observer) =>
        entries.forEach((entry) => currentCallback(entry, observer)),
      intersectionOpts,
    );

    if (target) {
      obs.observe(target);

      return () => {
        obs.unobserve(target);
      };
    }
  }, [compRef, intersectionOpts]);

  return (
    <Comp ref={compRef} {...props}>
      {children}
    </Comp>
  );
};
