import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  useState,
  useEffect,
  memo,
  useCallback,
  createContext,
  type PropsWithChildren,
  useContext,
} from 'react';
import { flow, pipe } from 'effect';
import { TrashIcon } from '@radix-ui/react-icons';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Sdometer } from '@/components/ui/sdometer';
import { setMinutesToDate } from '@/components/ui/timeline/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuPortal,
} from '@/components/ui/context-menu';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Menu, MenuItem } from '@/components/ui/menu';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { records, services } from '@/shrekServices';
import { activeCard } from '@/components/ui/timeline/store';

import type { CardProps } from './types';

const CardContext = createContext<{
  fields: CardProps['fields'];
  isSelected: CardProps['isSelected'];
}>({
  fields: {} as unknown as CardProps['fields'],
  isSelected: false,
});

const Root = memo<PropsWithChildren<Pick<CardProps, 'isSelected' | 'fields'>>>(
  ({ children, fields, isSelected }) => {
    return <CardContext value={{ fields, isSelected }}>{children}</CardContext>;
  },
);

const LongpressMenu = ({ children }: PropsWithChildren) => {
  const { fields } = useContext(CardContext);

  return (
    <ContextMenu>
      <ContextMenuTrigger onKeyDown={e => e.preventDefault()}>
        {children}
      </ContextMenuTrigger>

      <ContextMenuPortal>
        <ContextMenuContent>
          <ContextMenuItem
            variant="destructive"
            onClick={e => {
              e.stopPropagation();
              records.deleteOne(fields?.id);
            }}
          >
            <TrashIcon />
            Удалить
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenu>
  );
};

const PendingButton = ({ className }: React.ComponentProps<'div'>) => {
  const { fields } = useContext(CardContext);

  return (
    <div className={cn('p-1', className)}>
      <Toggle
        variant="outline"
        className="text-sm text-foreground font-mono font-bold border-destructive"
        onPressedChange={e => console.log(e)}
        onClick={e => e.stopPropagation()}
      >
        {fields.pendings.active}/{fields.pendings.limits}
      </Toggle>
    </div>
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

  return (
    <div
      className={cn(
        'min-w-full min-h-[2.5lh] text-2xs select-none transition-foo bg-card text-foreground',
        isSelected && 'bg-[coral]',
        className,
      )}
    >
      <div className="text-4xl sticky top-[1lh]">
        {isSelected && (
          <div className="flex font-mono text-xl">
            <time
              className={cn(
                'text-foreground inline-flex',
                activeCard.getState().isResizeMode || 'text-current',
              )}
              dateTime={format(
                String(records.store.editableRightNow.getState().fields?.from),
                'MM-dd',
              )}
            >
              <Sdometer
                value={format(
                  String(
                    records.store.editableRightNow.getState().fields?.from,
                  ),
                  'HH:mm',
                )}
              />
            </time>
            <span className="text-foreground">-</span>
            <time
              className={cn(
                'text-foreground inline-flex',
                activeCard.getState().isResizeMode && 'text-current',
              )}
              dateTime={format(
                String(records.store.editableRightNow.getState().fields?.to),
                'MM-dd',
              )}
            >
              <Sdometer
                value={format(
                  String(records.store.editableRightNow.getState().fields?.to),
                  'HH:mm',
                )}
              />
            </time>
          </div>
        )}

        {!isSelected && <div className="text-xl">{children}</div>}
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
      size: flow(
        () => [fields.from, fields.to].map(dateToDisplayUnits),
        ([from, to]) => to - from,
      )(),
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

  useEffect(() => {
    const { fields: editableFields } =
      records.store.editableRightNow.getState();

    if (isSelected && editableFields) {
      records.store.editableRightNow.setState({
        fields: {
          ...editableFields,

          from: pipe(
            displayedFields.top,
            displayUnitsToMinutes,
            setMinutesToDate(editableFields.from),
          ),

          to: pipe(
            displayedFields.top + displayedFields.size,
            displayUnitsToMinutes,
            setMinutesToDate(editableFields.to),
          ),
        },
      });
    }
  }, [displayedFields, displayUnitsToMinutes, isSelected]);

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

export const ClientCard = ({ fields, isSelected, ...rest }: CardProps) => {
  const { data: serviceList } = services.useGet();

  const [open, setOpen] = useState(false);

  const makeAppointment = useMutation({
    mutationFn: (serviceIdList: number[]) =>
      records.makeAppointment(fields.id, serviceIdList),
  });

  console.debug('ClientCard::', fields);

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
                  !makeAppointment.isPending && setOpen(false);
                }}
                className="h-dvh min-w-full p-0 flex flex-col gap-8 rounded-none bg-transparent backdrop-blur-xl"
                onPointerDownOutside={e => e.preventDefault()}
              >
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-serif font-normal">
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
                      )
                        setOpen(false);
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
};

export const OwnerCard = ({ fields, isSelected, ...rest }: CardProps) => {
  return (
    <Root fields={fields} isSelected={isSelected}>
      <LongpressMenu>
        <TheCard {...rest}>
          <Content
            className={cn(
              'text-stands-out',
              fields.pendings.limits === fields.pendings.active &&
                'bg-emerald-200/50 text-[coral]',
            )}
          >
            <div className="flex">
              <div className="flex-col">
                <Sign />
                <Badges />
              </div>
              <PendingButton className="ml-auto" />
            </div>
          </Content>
        </TheCard>
      </LongpressMenu>
    </Root>
  );
};
