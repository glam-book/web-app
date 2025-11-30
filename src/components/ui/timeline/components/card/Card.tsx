import { useMutation } from '@tanstack/react-query';
import { openLink } from '@tma.js/sdk-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { pipe } from 'effect';
import {
  createContext,
  memo,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Menu, MenuItem } from '@/components/ui/menu';
import { Sdometer } from '@/components/ui/sdometer';
import { activeCard } from '@/components/ui/timeline/store';
import { setMinutesToDate } from '@/components/ui/timeline/utils';
import { cn } from '@/lib/utils';
import { records, services } from '@/shrekServices';

import type { CardProps } from './types';

// Animated arrow indicators for drag/resize affordance
const useInjectArrowStyles = () => {
  // inject CSS keyframes once
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

const ArrowSVG = ({
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

const ArrowsIndicator = ({
  isResizeMode,
}: {
  isResizeMode: boolean;
}) => {
  useInjectArrowStyles();

  if (isResizeMode) {
    // ^ v
    return (
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center justify-center">
        <span className="flex flex-col items-center gap-1 text-sm opacity-95">
          <div className="flex items-center gap-3 bg-black/10 rounded-full px-3 py-1 backdrop-blur-sm text-xs font-mono whitespace-nowrap">
            нажмите еще раз чтобы переместить
          </div>
          <span className="tl-arrow tl-arrow--y rev text-sm">
            <ArrowSVG direction="down" />
          </span>
          <span className="tl-arrow tl-arrow--y rev text-sm">
            <ArrowSVG direction="up" />
          </span>
        </span>
      </div>
    );
  }

  // < >
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-3">
        <span className="tl-arrow tl-arrow--y rev text-sm">
          <ArrowSVG direction="down" />
        </span>
        {/* <span className="text-xs font-mono">переместить</span> */}
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

const CardContext = createContext<{
  fields: CardProps['fields'];
  isSelected: CardProps['isSelected'];
}>({
  fields: {} as unknown as CardProps['fields'],
  isSelected: false,
});

const Root = ({
  children,
  fields,
  isSelected,
}: PropsWithChildren<Pick<CardProps, 'isSelected' | 'fields'>>) => {
  return <CardContext value={{ fields, isSelected }}>{children}</CardContext>;
};

const PendingsContent = () => {
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

const Pendings = () => {
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
            console.log('overlay click!');
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

      <DrawerPortal>
        <DrawerContent
          className="pb-[calc(env(safe-area-inset-bottom)+0.2em)]"
          onClick={e => e.stopPropagation()}
        >
          <DrawerHeader>
            <DrawerTitle>Запросы на услугу</DrawerTitle>
            <DrawerDescription className="hidden">
              info about clients
            </DrawerDescription>
          </DrawerHeader>
          <PendingsContent />
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};

const Badges = () => {
  const { fields } = useContext(CardContext);

  const { data: serviceList } = services.useGet();

  return (
    <span className="inline-flex gap-0.5 empty:hidden">
      {Array.from(fields.serviceIdList, serviceId => {
        const title = serviceList?.get(serviceId)?.title;

        return (
          title && (
            <Badge
              className="bg-[deepskyblue] font-bold font-mono"
              variant="destructive"
              key={serviceId}
            >
              {title}
            </Badge>
          )
        );
      })}
    </span>
  );
};

const Sign = () => {
  const { fields } = useContext(CardContext);

  return (
    <p className="text-foreground text-left empty:hidden">{fields.sign}</p>
  );
};

const Content = ({ className, children }: React.ComponentProps<'div'>) => {
  const { isSelected } = useContext(CardContext);
  const { fields: editableRightNowFields } = records.store.editableRightNow();
  const { isResizeMode } = activeCard();

  return (
    <div
      className={cn(
        'min-w-full min-h-[2.5lh] text-2xs select-none transition-foo bg-card text-foreground',
        isSelected && 'bg-accent-strong rounded-bl-lg',
        className,
      )}
    >
      {isSelected && <ArrowsIndicator isResizeMode={isResizeMode} />}
      <div className="text-4xl sticky top-[1lh]">
        {isSelected && (
          <div className="flex font-mono text-xl">
            <time
              className={cn(
                'text-foreground inline-flex',
                isResizeMode || 'text-current',
              )}
              dateTime={format(String(editableRightNowFields?.from), 'MM-dd')}
            >
              <Sdometer
                value={format(String(editableRightNowFields?.from), 'HH:mm')}
              />
            </time>
            <span className="text-foreground">-</span>
            <time
              className={cn(
                'text-foreground inline-flex',
                isResizeMode && 'text-current',
              )}
              dateTime={format(String(editableRightNowFields?.to), 'MM-dd')}
            >
              <Sdometer
                value={format(String(editableRightNowFields?.to), `HH:mm`)}
              />
            </time>
          </div>
        )}

        {!isSelected && <div className="text-xl py-1">{children}</div>}
      </div>
    </div>
  );
};

export const TheCard = ({
  aimPosition,
  minCardSize = 2.5,
  convertToSpecificDisplayUnits,
  dateToDisplayUnits,
  displayUnitsToMinutes,
  clickHandler,
  disabled,
  children,
}: Omit<CardProps, 'fields' | 'isSelected'>) => {
  const { fields, isSelected } = useContext(CardContext);

  const calcDisplayedFields = useCallback(
    () => ({
      top: dateToDisplayUnits(fields.from),
      size: pipe(
        [fields.from, fields.to].map(dateToDisplayUnits),
        ([from, to]) => to - from,
      ),
    }),
    [fields, dateToDisplayUnits],
  );

  const [displayedFields, setDisplayedFields] = useState(calcDisplayedFields);

  useEffect(() => {
    if (isSelected) {
      setDisplayedFields(prev => ({
        top: activeCard.getState().isResizeMode
          ? Math.min(aimPosition, prev.top)
          : aimPosition,

        size: activeCard.getState().isResizeMode
          ? Math.max(aimPosition - prev.top, minCardSize)
          : prev.size,
      }));
    }
  }, [isSelected, aimPosition, minCardSize]);

  const displayUnitsToDate = useCallback(
    (units: number, base = new Date()) =>
      pipe(units, displayUnitsToMinutes, setMinutesToDate(base)),
    [displayUnitsToMinutes],
  );

  useEffect(() => {
    const editableFields = records.store.editableRightNow.getState().fields;

    if (isSelected && editableFields) {
      records.store.editableRightNow.setState({
        fields: {
          ...editableFields,
          from: displayUnitsToDate(displayedFields.top, editableFields.from),
          to: displayUnitsToDate(
            displayedFields.top + displayedFields.size,
            editableFields.from,
          ),
        },
      });
    }
  }, [displayedFields, displayUnitsToDate, isSelected]);

  const onClick = () => {
    clickHandler(fields);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'flex absolute w-full',
        isSelected && 'shadow-2xl z-1 translate-y-0 translate-x-5',
        'transition-foo',
      )}
      style={{
        top: convertToSpecificDisplayUnits(displayedFields.top),
        height: convertToSpecificDisplayUnits(displayedFields.size),
      }}
    >
      {children}
    </div>
  );
};

export const ClientCard = memo(({ fields, isSelected, ...rest }: CardProps) => {
  const { data: serviceList } = services.useGet();

  const [open, setOpen] = useState(false);

  const makeAppointment = useMutation({
    mutationFn: (serviceIdList: number[]) =>
      records.makeAppointment(fields.id, serviceIdList),
  });

  if (!fields.pendigable) return;

  return (
    <Root fields={fields} isSelected={isSelected}>
      <TheCard {...rest} disabled>
        <Content>
          <div className="flex min-h-[2.5lh] items-center justify-center">
            <Dialog open={open}>
              <DialogTrigger asChild>
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    setOpen(true);
                  }}
                  className="max-w-full bg-[cornflowerblue] hover:bg-[cornflowerblue] focus-visible:bg-[cornflowerblue]"
                  variant="destructive"
                >
                  Записаться
                </Button>
              </DialogTrigger>
              <DialogOverlay className="opacity-100 bg-transparent" />
              <DialogContent
                onClick={e => {
                  e.stopPropagation();
                }}
                className="h-dvh min-w-full p-0 flex flex-col gap-8 rounded-none bg-transparent backdrop-blur-xl"
                onPointerDownOutside={e => e.preventDefault()}
              >
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-normal">
                    <span className="inline-flex flex-col">
                      <time>
                        {format(fields.from, 'dd MMMM', { locale: ru })}
                      </time>
                      <time className="text-3xl">
                        {format(fields.from, 'HH:mm')}-
                        {format(fields.to, 'HH:mm')}
                      </time>
                    </span>
                  </DialogTitle>
                  <DialogDescription className="hidden">
                    (desc)
                  </DialogDescription>
                </DialogHeader>

                <form
                  id="select-service-form"
                  onClick={e => e.stopPropagation()}
                  onSubmit={e => {
                    e.preventDefault();
                    const form: HTMLFormElement = e.currentTarget;
                    const serviceIdList = Array.from(
                      form.querySelectorAll<HTMLInputElement>(
                        'input[type="radio"]:checked',
                      ),
                      input => Number(input.value),
                    );

                    if (
                      fields.serviceIdList.size > 0 &&
                      serviceIdList.length === 0
                    ) {
                      toast.error('Выберите хотябы один сервис');
                      return;
                    }

                    makeAppointment
                      .mutateAsync(serviceIdList)
                      .then(() => {
                        toast.success('Ура! Вы записаны');
                        setOpen(false);
                      })
                      .catch(e => {
                        console.warn(e);
                        toast.error('упс');
                      });
                  }}
                  className="flex-1 min-h-1 content-grid pb-6"
                >
                  <div
                    className="flex flex-col"
                    onClick={e => {
                      if (
                        e.currentTarget === e.target &&
                        !makeAppointment.isPending
                      ) {
                        setOpen(false);
                      }
                    }}
                  >
                    <Menu>
                      {Array.from(fields.serviceIdList, serviceId =>
                        serviceList?.get(serviceId),
                      )
                        .filter(i => i !== undefined)
                        .map(i => (
                          <Label
                            key={i.id}
                            className="flex justify-between p-4 font-mono"
                          >
                            <span className="flex flex-1 gap-2 items-center relative overflow-hidden">
                              <MenuItem
                                className="overflow-y-auto"
                                value={String(i.id)}
                              />
                              <span>{i.title}</span>
                            </span>
                            <span>
                              {new Intl.NumberFormat('ru-RU', {
                                style: 'currency',
                                currency: 'RUB',
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 0,
                              }).format(i.price)}
                            </span>
                          </Label>
                        ))}
                    </Menu>

                    <Button
                      disabled={makeAppointment.isPending}
                      className="self-end mt-auto"
                      type="submit"
                    >
                      Подтвердить запись
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Content>
      </TheCard>
    </Root>
  );
});

export const OwnerCard = memo(({ fields, isSelected, ...rest }: CardProps) => {
  return (
    <Root fields={fields} isSelected={isSelected}>
      <TheCard {...rest}>
        <Content
          className={cn(
            'text-stands-out',
            fields.pendings.limits === fields.pendings.active &&
            'bg-emerald-200/50 text-[coral]',
          )}
        >
          <div className="flex justify-between">
            <div className="flex-col">
              <Sign />
              <Badges />
            </div>
            <Pendings />
          </div>
        </Content>
      </TheCard>
    </Root>
  );
});
