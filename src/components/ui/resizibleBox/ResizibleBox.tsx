import type { ReactNode } from 'react';

export const ResizibleBox = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-pink-100 border border-dashed resize-y overflow-hidden p-2">
      {children}
    </div>
  );
};
