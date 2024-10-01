export const closest = (
  predicate: (element: HTMLElement) => boolean,
  entry: HTMLElement
): HTMLElement | null => {
  let element: HTMLElement | null = entry;

  while (element && !predicate(element)) {
    element = element.parentElement;
  }

  return element;
};
