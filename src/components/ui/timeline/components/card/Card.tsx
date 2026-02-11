import { Schema, Arbitrary, FastCheck } from 'effect';
import { useMutation } from '@tanstack/react-query';
import { format, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';
import { pipe } from 'effect';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Itself as Service } from '@/shrekServices/services/schemas';
import { MapFromArrayWithIdsOrUndefined } from '@/transformers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Menu, MenuItem } from '@/components/ui/menu';
import { Button } from '@/components/ui/button';
import { activeCard } from '@/components/ui/timeline/store';
import { setMinutesToDate } from '@/components/ui/timeline/utils';
import { cn } from '@/lib/utils';
import { records, services } from '@/shrekServices';

import type { CardProps } from './types';

import { CardContext, Root } from './CardContext';
import { Content } from './Content';
import { Badges } from './Badges';
import { Pendings } from './Pendings';

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
  const { fields } = useContext(CardContext);
  const { isUnfreezed } = activeCard();
  const selectedCardState = records.store.editableRightNow();
  const isSelected = selectedCardState.fields?.id === fields.id;

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
    if (isSelected && isUnfreezed) {
      setDisplayedFields(prev => ({
        top: activeCard.getState().isResizeMode
          ? Math.min(aimPosition, prev.top)
          : aimPosition,

        size: activeCard.getState().isResizeMode
          ? Math.max(aimPosition - prev.top, minCardSize)
          : prev.size,
      }));
    }
  }, [isSelected, isUnfreezed, aimPosition, minCardSize]);

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
        'flex absolute left-0 w-full rounded-md',
        isSelected && 'z-1 translate-x-[3ch]',
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

const arb = Arbitrary.make(Service);
const sample = FastCheck.sample(arb, 10);

const serviceListWithInOrderId = Schema.decodeUnknownSync(
  MapFromArrayWithIdsOrUndefined(Service),
)(sample.map((i, idx) => ({ ...i, id: idx })));

export const ClientCard = memo(({ fields, ...rest }: CardProps) => {
  const { data: serviceList = serviceListWithInOrderId } = services.useGet();

  const [open, setOpen] = useState(false);

  const makeAppointment = useMutation({
    mutationFn: (serviceIdList: number[]) =>
      records.makeAppointment(fields.id, serviceIdList),
  });

  return (
    <Root fields={fields}>
      <TheCard {...rest} disabled>
        <Content>
          <div className="pl-[2ch] flex-1 max-w-full flex flex-col items-center justify-center gap-y-1">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  fashion="fancy"
                  className="flex-1 w-full"
                  onClick={e => {
                    e.stopPropagation();
                    setOpen(true);
                  }}
                >
                  Записаться
                </Button>
              </DialogTrigger>

              <DialogContent
                onClick={e => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="h-dvh min-w-full p-0 pb-10 flex flex-col justify-end-safe bg-transparent backdrop-blur-md"
                onPointerDownOutside={e => e.preventDefault()}
              >
                <div className="content-grid">
                  <div className="pt-4 pb-2 card shadow-none">
                    <DialogHeader className="pb-2 text-left">
                      <DialogTitle className="pl-6 text-2xl uppercase font-normal">
                        <time>
                          <span className="text-red-600/80">
                            {format(fields.from, 'dd ', { locale: ru })}
                          </span>
                          <span className="text-red-600/80">
                            {format(fields.from, 'MMMM', { locale: ru })}
                          </span>
                        </time>
                        <br />С <time>{format(fields.from, 'HH:mm')}</time> ПО{' '}
                        <time>{format(fields.to, 'HH:mm')}</time>
                        <span> *</span>
                      </DialogTitle>
                      <DialogDescription className="hidden">
                        (desc)
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      id="select-service-form"
                      onClick={e => e.stopPropagation()}
                      className="min-h-1 h-min"
                      onSubmit={e => {
                        e.preventDefault();
                        const form: HTMLFormElement = e.currentTarget;
                        const serviceIdList = Array.from(
                          form.querySelectorAll<HTMLInputElement>(
                            'input[type="radio"]:checked',
                          ),
                          input => Number(input.value),
                        );

                        if (isBefore(fields.from, new Date())) {
                          toast.warning('Дата уже прошла 😭');
                          return;
                        }

                        if (
                          fields.serviceIdList.size > 0 &&
                          serviceIdList.length === 0
                        ) {
                          toast.warning('Выберите хотя бы одну услугу');
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
                    >
                      <div
                        className="flex flex-col justify-end-safe"
                        onClick={e => {
                          if (
                            e.currentTarget === e.target &&
                            !makeAppointment.isPending
                          ) {
                            setOpen(false);
                          }
                        }}
                      >
                        <Menu className="mb-5">
                          {Array.from(fields.serviceIdList, serviceId =>
                            serviceList?.get(serviceId),
                          )
                            .filter(i => i !== undefined)
                            .map(i => (
                              <Label
                                key={i.id}
                                className="flex justify-between p-4 text-base"
                              >
                                <span className="flex flex-1 gap-2 items-center relative overflow-hidden">
                                  <MenuItem
                                    className="overflow-y-auto"
                                    value={String(i.id)}
                                  />
                                  <span>{i.title}</span>
                                </span>
                                <span className="font-mono">
                                  {new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                  }).format(i.price ?? 0)}
                                </span>
                              </Label>
                            ))}
                        </Menu>

                        <p className="px-4 py-2 text-sm">
                          * Фактическая продолжительность услуги может
                          отличаться от заявленой
                        </p>

                        <div className="px-2">
                          <Button
                            className="w-full"
                            fashion="fancy"
                            disabled={makeAppointment.isPending}
                            type="submit"
                          >
                            Подтвердить запись
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="max-w-full w-full overflow-x-auto scrollbar-hidden">
              <Badges />
            </div>
          </div>
        </Content>
      </TheCard>
    </Root>
  );
});

export const OwnerCard = memo(({ fields, ...rest }: CardProps) => {
  return (
    <Root fields={fields}>
      <TheCard {...rest}>
        <Content
          className={cn(
            'text-stands-out',
            fields.pendings.active > 0 && 'bg-success/40 text-[coral]',
          )}
        >
          <div className="pl-[2ch] w-full flex flex-col gap-0.5">
            <div className="flex gap-0.5 items-center">
              <span className="block text-sm text-foreground truncate">
                {fields?.sign}
              </span>
              <Pendings>
                <Button
                  variant="secondary"
                  className="h-auto py-1 text-primary-foreground font-mono text-xs"
                  size="icon"
                  onClick={e => e.stopPropagation()}
                >
                  {fields.pendings.active}/{fields.pendings.limits}
                </Button>
              </Pendings>
            </div>

            <div className="max-w-full overflow-x-auto scrollbar-hidden">
              <Badges />
            </div>
          </div>
        </Content>
      </TheCard>
    </Root>
  );
});
