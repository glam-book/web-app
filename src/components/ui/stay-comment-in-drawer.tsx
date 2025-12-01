import { useEffect, useLayoutEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogTrigger,
} from '@/components/generated/dialog';
import { cn } from '@/lib/utils';

let hh = 0;

export const StayCommentInDrawer = () => {
  const [s, ss] = useState(false);
  // const [v, sv] = useState(false);
  const [h, sh] = useState(hh);

  // useLayoutEffect(() => {
  //   if (s) {
  //     document.body.style.position = 'absolute';
  //     document.body.style.overflow = 'hidden';
  //   }
  //   return () => {
  //     document.body.style.position = '';
  //   };
  // }, [s]);

  useEffect(() => {
    let id: number;

    const f = () => {
      clearTimeout(id);
      id = window.setTimeout(() => {
        // if (hh) return;
        const q = Math.round(window.visualViewport?.height ?? 0);
        sh(q);
        hh = q;
      }, 0);
    };

    visualViewport?.addEventListener('resize', f);

    return () => {
      visualViewport?.removeEventListener('resize', f);
    };
  }, []);

  useEffect(() => {
    if (!s) return;
    document.querySelector('#hui')?.focus();
  }, [s]);

  // useEffect(() => {
  //   const input: HTMLInputElement | null = document.querySelector('#hui');
  //   if (!input) return;
  //   // input.value = String(h);
  // }, [h]);

  return (
    <div>
      <Button
        onClick={() => {
          ss(true);
        }}
        type="button"
      >
        STAY COMMENT
      </Button>
      {s && (
        <div
          // style={{ top: `${h}px` }}
          className={cn(
            'fixed bg-zinc-200 z-20 bottom-0 h-min w-full flex flex-col',
            // v && 'opacity-100',
          )}
        >
          <textarea
            onBlur={() => requestAnimationFrame(() => ss(false))}
            className="min-h-[2lh] bg-background"
            id="hui"
            value={h}
          />
          <ul
            onClick={e => {
              e.preventDefault();
              const input: HTMLInputElement | null =
                document.querySelector('#hui');
              input?.focus();
              console.log('hui');
            }}
          >
            <li
              className="inline-flex"
              onClick={e => {
                const input: HTMLInputElement | null =
                  document.querySelector('#hui');
                if (!input) return;
                input.value += e.currentTarget.innerText;
              }}
            >
              😍
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

// export const StayCommentInDrawer = () => {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button type="button">STAY COMMENT</Button>
//       </DialogTrigger>
//       <DialogContent className="bg-zinc-200 p-0 min-w-full h-dvh justify-center">
//         <div className="self-end-safe">
//           <textarea className="min-h-[2lh] bg-background" id="hui" />
//           <ul
//             onClick={e => {
//               e.preventDefault();
//               const input: HTMLInputElement | null =
//                 document.querySelector('#hui');
//               input?.focus();
//               console.log('hui');
//             }}
//           >
//             <li
//               className="inline-flex"
//               onClick={e => {
//                 const input: HTMLInputElement | null =
//                   document.querySelector('#hui');
//                 if (!input) return;
//                 input.value += e.currentTarget.innerText;
//               }}
//             >
//               😍
//             </li>
//           </ul>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };
