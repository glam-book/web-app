import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { services } from '@/shrekServices';
import { useContext, useEffect, useRef, useState } from 'react';
import { CardContext } from './CardContext';

export const Badges = () => {
  const { fields } = useContext(CardContext);
  const { data: serviceList } = services.useGet();

  const svcArray = fields.serviceIdList
    ? (Array.from(fields.serviceIdList)
        .map(id => serviceList?.get(id))
        .filter(Boolean) as { id: number; title: string; price: number }[])
    : [];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(svcArray.length);

  const ServicesDialog = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);

    return (
      <Dialog open={open}>
        <DialogTrigger asChild>
          <div onClick={e => { e.stopPropagation(); setOpen(true); }}>{children}</div>
        </DialogTrigger>
        <DialogOverlay className="opacity-100 bg-transparent" />
        <DialogContent onClick={e => e.stopPropagation()} className="max-w-md w-[min(95vw,420px)] p-4 rounded-md">
          <DialogHeader>
            <DialogTitle>Сервисы</DialogTitle>
            <div className="mt-3 space-y-2">
              {svcArray.map(svc => (
                <div key={svc.id} className="flex justify-between items-center p-2 rounded hover:bg-accent/5 cursor-pointer">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{svc.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(svc.price)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">›</div>
                </div>
              ))}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  };

  useEffect(() => {
    if (!containerRef.current || !measureRef.current) return;

    const gap = 8; // tailwind gap-2

    const measure = () => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const containerHeight = containerRef.current?.clientHeight ?? 0;



      // collect widths and also measure sample item height
      const widths: number[] = [];
      let sampleHeight = 0;
      svcArray.forEach(svc => {
        const el = measureRef.current?.querySelector(`[data-svc="${svc.id}"]`) as HTMLElement | null;
        if (el) {
          widths.push(el.offsetWidth);
          if (!sampleHeight) sampleHeight = el.offsetHeight;
        } else {
          widths.push(0);
        }
      });

      // compute how many rows fit vertically (include gap between rows)
      const rowGap = gap; // use same gap for vertical spacing
      const rowHeight = sampleHeight || 24; // fallback
      const maxRows = rowHeight > 0 ? Math.max(1, Math.floor((containerHeight + rowGap) / (rowHeight + rowGap))) : 1;

      // simulate placing badges into rows of width `containerWidth`
      let rowsUsed = 1;
      let sum = 0;
      let fitCount = 0;
      let lastRowUsedWidth = 0;

      for (let i = 0; i < widths.length; i++) {
        const w = widths[i];
        // if this is first in row, don't add leading gap
        const spaceIfPlaced = sum === 0 ? w : sum + w + gap;

        if (spaceIfPlaced <= containerWidth) {
          // place in current row
          sum = spaceIfPlaced;
          fitCount++;
          lastRowUsedWidth = sum;
        } else {
          // need new row
          if (rowsUsed < maxRows) {
            rowsUsed++;
            // place on new row
            sum = w;
            // if the badge doesn't even fit a single row, still count it
            if (w > containerWidth) {
              // it'll overflow horizontally, but we count it as placed
              sum = w;
            }
            fitCount++;
            lastRowUsedWidth = sum;
          } else {
            // no more rows available
            break;
          }
        }
      }

      // if not all badges fit, ensure there's room for the +n button in the last row;
      if (fitCount < svcArray.length) {
        const btnEl = measureRef.current?.querySelector('[data-measure-btn]') as HTMLElement | null;
        const btnW = btnEl ? btnEl.offsetWidth + gap : 0;
        if (lastRowUsedWidth + gap + btnW > containerWidth) {
          // remove last badge to make room for button
          fitCount = Math.max(0, fitCount - 1);
        }
      }

      setVisibleCount(fitCount);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    ro.observe(measureRef.current);
    window.addEventListener('resize', measure);

    measure();

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [svcArray]);

  if (svcArray.length === 0) return null;

  const restCount = Math.max(0, svcArray.length - visibleCount);

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-2 w-full">
      {svcArray.slice(0, visibleCount).map(svc => {
        const price = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(svc.price);

        return (
          <div key={svc.id} className="inline-block">
            <Badge
              variant="destructive"
              className="flex items-center gap-2 px-2 py-1 rounded-md bg-badge-green text-sm font-medium text-foreground"
              title={`${svc.title} — ${price}`}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-[13px]">{svc.title}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{price}</div>
              </div>
            </Badge>
          </div>
        );
      })}

      <ServicesDialog>
        <Button ref={buttonRef} variant="default" size="sm" className="font-mono text-sm px-2">{restCount > 0 ? `+${restCount}` : 'услуги'}</Button>
      </ServicesDialog>

      {/* hidden measurement container */}
      <div ref={measureRef} aria-hidden className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
        {svcArray.map(svc => {
          const price = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(svc.price);
          return (
            <div key={svc.id} data-svc={svc.id} className="inline-block">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-[13px]">{svc.title}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{price}</div>
                </div>
              </div>
            </div>
          );
        })}
          {/* hidden sample of the +n button for measurement (matches Button classes) */}
          <div data-measure-btn className="inline-block">
            <div className="font-mono text-sm px-2 inline-flex items-center">+99</div>
          </div>
      </div>
    </div>
  );
};
