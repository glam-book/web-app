import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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

export const IntersectionObserverViewport = forwardRef<
  HTMLDivElement,
  IntersectionObserverViewportProps
>(
  (
    { callback, options, target, className, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';
    const compRef = useRef<HTMLDivElement>(null);
    const callbackRef = useRef<IntersectionObserverCallback>(
      (entries, observer) =>
        entries.forEach((entrie) => {
          callback?.(entrie, observer);
        })
    );
    const optionsRef = useRef(options);

    useImperativeHandle(ref, () => compRef.current as HTMLDivElement, []);

    useEffect(() => {
      const observer = new IntersectionObserver(callbackRef.current, {
        ...optionsRef.current,
        root: compRef.current,
      });

      if (target) {
        observer.observe(target);

        return () => {
          observer.unobserve(target);
        };
      }
    }, [target]);

    return <Comp ref={compRef} className={className} {...props} />;
  }
);
