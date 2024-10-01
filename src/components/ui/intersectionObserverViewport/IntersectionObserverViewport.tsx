import { useEffect, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

type IntersectionObserverViewportProps =
  React.HTMLAttributes<HTMLDivElement> & {
    callback?: (
      entrie: IntersectionObserverEntry,
      observer: IntersectionObserver
    ) => void;
    options?: IntersectionObserverInit;
    target?: Element;
    asChild?: boolean;
  };

export const IntersectionObserverViewport = ({
  callback,
  options,
  target,
  className,
  asChild = false,
  ...props
}: IntersectionObserverViewportProps) => {
  const Comp = asChild ? Slot : 'div';
  const compRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<IntersectionObserverCallback>(
    (entries, observer) =>
      entries.forEach((entrie) => {
        callback?.(entrie, observer);
      })
  );
  const optionsRef = useRef(options);

  useEffect(() => {
    const observer = new IntersectionObserver(callbackRef.current, {
      ...optionsRef.current,
      root: compRef.current,
    });

    if (target) {
      observer.observe(target);

      console.log('bind obs', target);

      return () => {
        observer.unobserve(target);
        console.log('unbind obs', target);
      };
    }
  }, [target]);

  return <Comp ref={compRef} className={className} {...props} />;
};
