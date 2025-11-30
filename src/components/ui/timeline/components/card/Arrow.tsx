import { useEffect } from 'react';

export const useInjectArrowStyles = () => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const id = 'tl-arrow-animations';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      @keyframes tl-bounce-y {
        0% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
        100% { transform: translateY(0); }
      }
      @keyframes tl-bounce-x {
        0% { transform: translateX(0); }
        50% { transform: translateX(6px); }
        100% { transform: translateX(0); }
      }
      .tl-arrow { display: inline-block; will-change: transform; }
      .tl-arrow--y { animation: tl-bounce-y 900ms ease-in-out infinite; }
      .tl-arrow--y.rev { animation-direction: reverse; }
      .tl-arrow--x { animation: tl-bounce-x 900ms ease-in-out infinite; }
    `;

    document.head.appendChild(style);
  }, []);
};

export const ArrowSVG = ({
  className = '',
  direction = 'down',
}: {
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}) => {
  const rotate =
    direction === 'up'
      ? 'rotate(0deg)'
      : direction === 'down'
      ? 'rotate(180deg)'
      : direction === 'left'
      ? 'rotate(-90deg)'
      : 'rotate(90deg)';

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: rotate }}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ArrowsIndicator = ({ isResizeMode }: { isResizeMode: boolean }) => {
  useInjectArrowStyles();

  if (isResizeMode) {
    return (
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center justify-center">
        <span className="flex flex-col items-center gap-1 text-sm opacity-95">
          <span className="tl-arrow tl-arrow--y rev text-sm">
            <ArrowSVG direction="down" />
          </span>
          <span className="tl-arrow tl-arrow--y rev text-sm">
            <ArrowSVG direction="up" />
          </span>
          <div className="flex items-center gap-3 bg-black/10 rounded-full px-3 py-1 backdrop-blur-sm text-xs font-mono whitespace-nowrap">
            нажмите еще раз чтобы переместить
          </div>
        </span>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-3">
        <span className="tl-arrow tl-arrow--y rev text-sm">
          <ArrowSVG direction="down" />
        </span>
        <span className="tl-arrow tl-arrow--y text-sm">
          <ArrowSVG direction="up" />
        </span>
      </div>
      <div className="flex items-center gap-3 bg-black/10 rounded-full px-3 py-1 backdrop-blur-sm">
        <span className="text-xs font-mono">нажмите еще раз чтобы растянуть</span>
      </div>
    </div>
  );
};
