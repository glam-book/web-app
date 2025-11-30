import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { services } from '@/shrekServices';
import { useContext, useState } from 'react';
import { CardContext } from './CardContext';

export const Badges = () => {
  const { fields } = useContext(CardContext);
  const { data: serviceList } = services.useGet();

  if (!fields.serviceIdList || fields.serviceIdList.size === 0) return null;

  const durationMin = Math.round((+fields.to - +fields.from) / 60000);
  const isNarrow = durationMin <= 45;

  const svcArray = Array.from(fields.serviceIdList)
    .map(id => serviceList?.get(id))
    .filter(Boolean) as { id: number; title: string; price: number }[];

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

  if (!isNarrow) {
    return (
      <div className="inline-flex flex-wrap gap-2 items-center empty:hidden">
        {svcArray.map(svc => {
          const price = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(svc.price);

          return (
            <Badge
              key={svc.id}
              variant="destructive"
              className="flex items-center gap-2 px-2 py-1 rounded-md bg-accent-secnd text-sm font-medium text-foreground"
              title={`${svc.title} — ${price}`}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-[13px]">{svc.title}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{price}</div>
              </div>
            </Badge>
          );
        })}
      </div>
    );
  }

  const first = svcArray[0];
  const restCount = Math.max(0, svcArray.length - 1);

  return (
    <div className="inline-flex items-center gap-2">
      {first && (
        <Badge
          key={first.id}
          variant="destructive"
          className="flex items-center gap-2 px-2 py-1 rounded-md bg-accent-secnd text-sm font-medium text-foreground"
          title={`${first.title} — ${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(first.price)}`}
        >
          <div className="min-w-0">
            <div className="truncate font-semibold text-[13px]">{first.title}</div>
          </div>
        </Badge>
      )}

      <ServicesDialog>
        <Button variant="default" size="sm" className="font-mono text-sm px-2">{restCount > 0 ? `+${restCount}` : 'услуги'}</Button>
      </ServicesDialog>
    </div>
  );
};
