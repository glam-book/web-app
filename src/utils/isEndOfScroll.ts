export const isEndOfScroll = (element: HTMLElement) =>
  element.offsetHeight + element?.scrollTop >= element?.scrollHeight;
