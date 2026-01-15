import { openLink } from '@tma.js/sdk-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useContext, useState } from 'react';

import { records } from '@/shrekServices';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { CardContext } from './CardContext';

export const PendingsContent = () => {
  const { fields } = useContext(CardContext);
  const { data: pendingList } = records.usePendingDetails(fields.id);

  return (
    <div>
      {pendingList?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Нет запросов
        </div>
      )}

      {pendingList?.length! > 0 && (
        <ul className="space-y-4 max-h-96 overflow-y-auto">
          {pendingList!.map((pending, idx) => (
            <li key={idx} className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {pending.contact.firstName} {pending.contact.lastName}
                  </p>
                  {pending.contact.tgUserName && (
                    <Button
                      variant="link"
                      className="text-sm text-cyan-600 p-0"
                      onClick={() => {
                        openLink(`https://t.me/${pending.contact.tgUserName}`);
                      }}
                    >
                      @{pending.contact.tgUserName}
                    </Button>
                  )}
                </div>
                <Badge variant={pending.confirmed ? 'default' : 'secondary'}>
                  {pending.confirmed ? 'Подтверждено' : 'Ожидание'}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {format(pending.requestTime, 'dd MMMM HH:mm', { locale: ru })}
              </p>

              <div className="space-y-1">
                {pending.services.map(service => (
                  <div
                    key={service.id}
                    className="text-sm flex justify-between"
                  >
                    <span>{service.title}</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        maximumFractionDigits: 0,
                      }).format(service.price)}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const Pendings = () => {
  const { fields } = useContext(CardContext);
  const [open, setOpen] = useState(false);

  return (
    <Drawer
      open={open}
      onOpenChange={internalOpen => {
        setOpen(internalOpen);
        requestAnimationFrame(() => {
          const overlay = document.querySelector('[data-vaul-overlay]');
          overlay?.addEventListener('click', e => {
            e.stopPropagation();
            setOpen(false);
          });
        });
      }}
    >
      <DrawerTrigger asChild>
        <Button
          className="font-mono"
          variant="secondary"
          onClick={e => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          {fields.pendings.active}/{fields.pendings.limits}
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className="pb-unified-safe"
        onClick={e => e.stopPropagation()}
      >
        <DrawerHeader>
          <DrawerTitle>Запросы на услугу</DrawerTitle>
          <DrawerDescription className="hidden">
            info about clients
          </DrawerDescription>
        </DrawerHeader>
        <div className="content-grid">
          <PendingsContent />
          <DrawerFooter className="pb-unified-safe">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              закрыть
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
