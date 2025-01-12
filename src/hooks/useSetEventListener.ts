import { useRef, useEffect } from 'react';

export const useSetEventListener = (
  element: HTMLElement | HTMLDocument | undefined | null,
  ...[eventName, listener, options]: Parameters<typeof addEventListener>
) => {
  const refToListener = useRef(listener);
  const refToOptions = useRef(options);

  useEffect(() => {
    const listenerInUseEffectFuckReact = refToListener.current;
    const optionsInUseEffectFuckReact = refToOptions.current;

    element?.addEventListener(
      eventName,
      listenerInUseEffectFuckReact,
      optionsInUseEffectFuckReact,
    );

    return () =>
      element?.removeEventListener(
        eventName,
        listenerInUseEffectFuckReact,
        optionsInUseEffectFuckReact,
      );
  }, [element, eventName]);
};
