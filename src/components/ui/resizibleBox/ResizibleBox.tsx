import { forwardRef, useRef, useState } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

export type ResizibleBoxProps = React.HTMLAttributes<HTMLDivElement> & {
  onResizeBox: (x: number, y: number, target: HTMLElement) => void;
  asChild?: boolean;
};

export const ResizibleBox = forwardRef<HTMLDivElement, ResizibleBoxProps>(
  ({ children, className, onResizeBox, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    const compRef = useRef<HTMLDivElement>(null);
    const [isCaptured, setIsCaptured] = useState(false);
    const topHandleStartPosition = useRef(0);

    return (
      <Comp
        ref={compRef}
        className={cn(className, 'relative flex flex-col')}
        {...props}
      >
        <div
          className="absolute top-[-1lh] bg-green-200 cursor-row-resize touch-none"
          onPointerDown={(e) => {
            console.log('pointer down');
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = e.currentTarget.getBoundingClientRect();
            // topHandleStartPosition.current = rect.y + rect.height / 2;
            topHandleStartPosition.current = e.clientY;
            console.log(topHandleStartPosition.current);
            setIsCaptured(true);
          }}
          onPointerMove={(e) => {
            if (isCaptured) {
              const yDiff = (topHandleStartPosition.current ?? 0) - e.clientY;
              console.log(yDiff);
              // console.log(yDiff);
              // setTopHeight(yDiff);
              onResizeBox(e.clientY, yDiff, compRef.current!);
            }
          }}
          onLostPointerCapture={() => {
            console.log('lost');
            setIsCaptured(false);
          }}
        >
          :::
        </div>
        <div className="flex-1 flex flex-col [&>*]:flex-1">{children}</div>
        <div className="absolute bottom-[-1lh] flex justify-center bg-green-200 cursor-row-resize">
          :::
        </div>
      </Comp>
    );
  },
);
