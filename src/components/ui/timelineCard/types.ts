export enum TimelineCardState {
  idle = 'idle',
  selected = 'selected',
}

export type TimelineCardProps = {
  toUnitsForDisplay: (n: number) => string;
  onChange?: (o: { position: number; size: number }) => void;
  sign: string;
  defaultPosition: number;
  defaultSize: number;
  aimPosition: number;
  className?: string;
};
