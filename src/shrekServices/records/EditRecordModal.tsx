import { produce } from 'immer';
import { MessageSquare, Plus, TrashIcon, X, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { format, intervalToDuration, formatDuration } from 'date-fns';
import { ru } from 'date-fns/locale';

import { records, services } from '@/shrekServices';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/generated/popover';

const snapPoints = ['320px', 1];

export const EditRecordModal = () => {
  const { fields: recordFields } = records.store.editableRightNow();
  const isCardSelected = Boolean(recordFields);
  const open = isCardSelected;

  const { data: serviceList } = services.useGet();

  const formRef = useRef<HTMLFormElement | null>(null);

  const recordServices = useMemo(
    () =>
      Array.from(
        serviceList ?? new Map<number, typeof services.schemas.Itself.Type>(),
        ([, v]) => v,
      ).filter(service => recordFields?.serviceIdList.has(service.id)),
    [serviceList, recordFields],
  );

  const prevServiceIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const a = new Set(
      (
        serviceList ?? new Map<number, typeof services.schemas.Itself.Type>()
      ).keys(),
    );

    records.store.editableRightNow.setState({
      fields: produce(recordFields, draft => {
        if (!draft) return;
        a.difference(prevServiceIdsRef.current).forEach(id =>
          draft.serviceIdList.add(id),
        );
      }),
    });

    prevServiceIdsRef.current = a;
  }, [serviceList]);

  useEffect(() => {
    if (open) {
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehavior = 'none';
    }

    return () => {
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [open]);

  const [snap, setSnap] = useState<number | null | string>(snapPoints[0]);

  useEffect(() => {
    setSnap(snapPoints[0]);
  }, [recordFields?.id]);

  const [isServicesDrawerOpen, setIsServicesDrawerOpen] = useState(false);

  const toggleService = (id: number) => {
    records.store.editableRightNow.setState({
      fields: produce(recordFields, draft => {
        if (!draft) return;
        draft.serviceIdList = new Set([id]).symmetricDifference(
          recordFields?.serviceIdList ?? new Set<number>(),
        );
      }),
    });
  };

  const [signTextarea, setSignTextArea] = useState<HTMLTextAreaElement | null>(
    null,
  );

  const updateSignField = useCallback((value: string) => {
    records.store.editableRightNow.setState({
      fields: produce(
        records.store.editableRightNow.getState().fields,
        draft => {
          if (!draft) return;
          draft.sign = value;
        },
      ),
    });
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const textarea = e.currentTarget as HTMLTextAreaElement;
      updateSignField(textarea.value);
    };

    signTextarea?.addEventListener('change', handler);

    return () => signTextarea?.removeEventListener('change', handler);
  }, [signTextarea, updateSignField]);

  useEffect(() => {
    if (signTextarea) {
      signTextarea.value = recordFields?.sign ?? '';
    }
  }, [recordFields?.id]);

  return (
    <Drawer
      open={open}
      onClose={() => {
        const form = formRef.current;
        form?.requestSubmit();
      }}
      noBodyStyles
      modal={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      repositionInputs={false}
    >
      <DrawerContent className="pb-unified-safe bg-blurable backdrop-blur-3xl">
        <DrawerHeader className="pb-3">
          <DrawerTitle className="hidden">Редактирование записи</DrawerTitle>
          <DrawerDescription className="hidden">
            Измените данные или удалите запись
          </DrawerDescription>

          <div className="flex justify-between items-center gap-1">
            <Button
              className="justify-self-end"
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (!confirm('Удалить запись?')) return;
                records.deleteOne(recordFields?.id);
              }}
            >
              <TrashIcon /> Удалить
            </Button>

            <DrawerClose asChild>
              <Button size="icon" variant="ghost">
                <X />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 px-4 py-1 overflow-y-auto">
          <form
            className="flex flex-col gap-4"
            id="edit-record-card"
            ref={formRef}
            onSubmit={e => {
              e.preventDefault();
              updateSignField(signTextarea?.value ?? '');
              records.finishEdit();
            }}
          >
            <div className="flex flex-wrap items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <TriangleAlert className="size-4 fill-yellow-300" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="px-6 py-2 w-80">
                  <p className="text-xs text-balance">
                    Кликните по карточке и скрольте, а потом еще раз 😘 Удачи!
                  </p>
                </PopoverContent>
              </Popover>
              <label className="inline-flex items-center gap-0.5">
                <input
                  type="time"
                  className="min-w-0 w-min px-2 bg-background rounded-xl corner-shape-squircle"
                  value={format(recordFields?.from ?? 0, 'HH:mm')}
                  disabled
                />
              </label>
              <span>—</span>
              <label className="inline-flex items-center gap-0.5">
                <input
                  type="time"
                  className="min-w-0 w-min px-2 bg-background rounded-xl corner-shape-squircle"
                  value={format(recordFields?.to ?? 0, 'HH:mm')}
                  disabled
                />
              </label>
              {false && recordFields?.from && recordFields?.to && (
                <>
                  =
                  <span>
                    {formatDuration(
                      intervalToDuration({
                        start: recordFields?.from!,
                        end: recordFields?.to!,
                      }),
                      { locale: ru },
                    )}
                  </span>
                </>
              )}
            </div>

            <div className="pt-1 flex flex-col gap-1">
              <Label className="hidden" htmlFor="sign">
                Комментарий
              </Label>
              <Textarea
                ref={setSignTextArea}
                id="sign"
                name="sign"
                defaultValue={recordFields?.sign ?? ''}
                placeholder="Заметка"
                className="h-[2lh] resize-none bg-background border-none outline-none rounded-xl"
              />
            </div>

            <Card className="p-3 pb-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-700" />
                  <h2 className="text-gray-900">Услуги</h2>
                </div>

                <Drawer
                  open={isServicesDrawerOpen}
                  onOpenChange={setIsServicesDrawerOpen}
                >
                  <DrawerTrigger asChild>
                    <Button size="sm">
                      <Plus />
                      Добавить
                    </Button>
                  </DrawerTrigger>

                  <DrawerContent className="pb-unified-safe">
                    <DrawerHeader>
                      <DrawerTitle>Выберите услугу</DrawerTitle>
                    </DrawerHeader>

                    <div className="overflow-y-auto flex-1 px-4 py-3">
                      <Button
                        variant="outline"
                        className="w-full mb-3 border-dashed"
                        onClick={() => {
                          setIsServicesDrawerOpen(false);
                          services.startEdit();
                        }}
                      >
                        <Plus />
                        Создать новую услугу
                      </Button>

                      <ul className="space-y-2">
                        {Array.from(
                          serviceList ??
                            new Map<
                              number,
                              typeof services.schemas.Itself.Type
                            >(),
                          ([_, service]) => {
                            const isAdded = Boolean(
                              recordFields?.serviceIdList.has(service.id),
                            );

                            return (
                              <li
                                key={service.id}
                                onClick={() => toggleService(service.id)}
                                className={cn(
                                  'p-3 border rounded-lg',
                                  isAdded && 'bg-gray-50 border-gray-300',
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h3 className="text-gray-900">
                                        {service.title}
                                      </h3>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                      <span>
                                        {new Intl.NumberFormat('ru-RU', {
                                          style: 'currency',
                                          currency: 'RUB',
                                          maximumFractionDigits: 0,
                                        }).format(service.price ?? 0)}
                                      </span>
                                    </div>
                                  </div>
                                  {isAdded && (
                                    <Badge className="shrink-0">✓</Badge>
                                  )}
                                </div>
                              </li>
                            );
                          },
                        )}
                      </ul>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>

              {recordServices.length === 0 ? (
                <div className="text-center pb-1 text-gray-500">
                  <MessageSquare className="w-11 h-10 mx-auto mb-2 opacity-50" />
                  <p>Услуги не добавлены</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recordServices.map(service => (
                    <div
                      key={service.id}
                      className="flex items-start gap-3 p-3 bg-white border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-gray-900">{service.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span>
                            {new Intl.NumberFormat('ru-RU', {
                              style: 'currency',
                              currency: 'RUB',
                              maximumFractionDigits: 0,
                            }).format(service.price ?? 0)}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleService(service.id)}
                        className="text-gray-500 active:text-red-600 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </form>
        </div>

        {snap !== 1 && <div className="h-[var(--snap-point-height)]" />}
      </DrawerContent>
    </Drawer>
  );
};
