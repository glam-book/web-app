import { produce } from 'immer';
import { MessageSquare, Plus, TrashIcon, X } from 'lucide-react';
import { useEffect, useRef, useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { records, services } from '@/shrekServices';
import { cn } from '@/lib/utils';

const snapPoints = ['320px', 1];

export const EditRecordModal = () => {
  const { fields: recordFields } = records.store.editableRightNow();
  const isCardSelected = Boolean(recordFields);
  const open = isCardSelected;

  const { data: serviceList } = services.useGet();

  const formRef = useRef<HTMLFormElement | null>(null);
  const [sign, setSign] = useState(String(recordFields?.sign || ''));
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
    setSign(String(recordFields?.sign || ''));
  }, [recordFields?.id]);

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
        <DrawerHeader className="px-0">
          <div className="content-grid">
            <DrawerTitle className="hidden">Редактирование записи</DrawerTitle>
            <DrawerDescription className="hidden">
              Измените данные или удалите запись
            </DrawerDescription>

            <Button
              className="justify-self-end"
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => {
                if (!confirm('Удалить запись?')) return;
                records.deleteOne(recordFields?.id);
              }}
            >
              <TrashIcon />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 pt-1 max-h-96 overflow-y-auto content-grid">
          <form
            className="flex flex-col gap-4"
            id="edit-record-card"
            ref={formRef}
            onSubmit={e => {
              e.preventDefault();

              records.store.editableRightNow.setState({
                fields: produce(recordFields, draft => {
                  if (!draft) return;
                  draft.sign = sign;
                }),
              });

              records.finishEdit();
            }}
          >
            <div className="pt-1 flex flex-col gap-1">
              <Label className="hidden" htmlFor="sign">
                Комментарий
              </Label>
              <Textarea
                id="sign"
                name="sign"
                value={sign}
                onChange={e => setSign(e.target.value)}
                placeholder="Заметка"
                className="h-[2lh] resize-none bg-background border-none outline-none"
              />
            </div>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
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

        <DrawerFooter>
          <Button
            variant="outline"
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
          >
            Закрыть
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
