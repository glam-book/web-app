import { forwardRef, useEffect, useRef, useState } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

export type ResizibleBoxProps = React.HTMLAttributes<HTMLDivElement> & {
  onBoxRsize?: (x: number, y: number, target: HTMLElement) => void;
  asChild?: boolean;
};

export const ResizibleBox = forwardRef<HTMLDivElement, ResizibleBoxProps>(
  ({ children, className, onBoxRsize, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    const compRef = useRef<HTMLDivElement>(null);
    const [isCaptured, setIsCaptured] = useState(false);
    const topHandleStartPosition = useRef(0);
    const [yDiff, setYdiff] = useState(0);

    useEffect(() => console.log(yDiff), [yDiff]);

    return (
      <Comp
        ref={compRef}
        className={cn(className, 'relative flex flex-col')}
        {...props}
      >
        <div
          className="absolute top-0 h-1 w-full cursor-row-resize bg-[lightblue]"
          style={{
            height: `${Math.max(yDiff, 2.5)}px`,
            translate: `0 -${yDiff}px`,
          }}
          onClick={console.log}
          onTouchStart={(e) => {
            console.log('pointer down');
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = e.currentTarget.getBoundingClientRect();
            // topHandleStartPosition.current = rect.y + rect.height / 2;
            topHandleStartPosition.current = e.clientY;
            console.log('start pos:::', topHandleStartPosition.current);
            setIsCaptured(true);
          }}
          // onPointerDown={(e) => {
          //   e.preventDefault();
          //   console.log('pointer down');
          //   e.currentTarget.setPointerCapture(e.pointerId);
          //   const rect = e.currentTarget.getBoundingClientRect();
          //   // topHandleStartPosition.current = rect.y + rect.height / 2;
          //   topHandleStartPosition.current = e.clientY;
          //   console.log('start pos:::', topHandleStartPosition.current);
          //   setIsCaptured(true);
          // }}
          onPointerMove={(e) => {
            if (isCaptured) {
              const yDiff = (topHandleStartPosition.current ?? 0) - e.clientY;
              console.log({ yDiff });
              setYdiff(yDiff);
              // setTopHeight(yDiff);
            }
          }}
          onLostPointerCapture={(e) => {
            console.log('lost');
            setIsCaptured(false);
            onBoxRsize(e.clientY, yDiff, compRef.current!);
          }}
        ></div>
        <div className="flex-1 flex flex-col [&>*]:flex-1">{children}</div>
        <div className="absolute bottom-[-1lh] flex justify-center bg-green-200 cursor-row-resize">
          :::
        </div>
      </Comp>
    );
  },
);
