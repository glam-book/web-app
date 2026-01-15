import { produce } from 'immer';
import { Clock, MessageSquare, Plus, TrashIcon, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { records, services } from '@/shrekServices';

const snapPoints = [0.5, 1];

type ServiceLike = {
  id: number;
  title?: string;
  name?: string;
  price?: number;
  category?: string;
  duration?: number;
};

export const EditRecordModal = () => {
  const { fields: recordFields } = records.store.editableRightNow();
  const isCardSelected = Boolean(recordFields);
  const open = isCardSelected;

  const { data: serviceList } = services.useGet();

  const makeServiceToggleDefaultFields = () =>
    recordFields?.serviceIdList
      ? Array.from(recordFields.serviceIdList, String)
      : [];

  const [serviceToggleFields, setServiceToggleFields] = useState<string[]>(
    makeServiceToggleDefaultFields,
  );

  const [sign, setSign] = useState(String(recordFields?.sign || ''));
  const formRef = useRef<HTMLFormElement | null>(null);
  const prevServiceIdsRef = useRef<number[]>([]);

  const [snap, setSnap] = useState<number | null | string>(snapPoints[0]);

  useEffect(() => {
    setSnap(snapPoints[0]);
  }, [recordFields?.id]);

  useEffect(() => {
    setServiceToggleFields(makeServiceToggleDefaultFields);
  }, [recordFields?.id]);

  useEffect(() => {
    if (!serviceList) {
      prevServiceIdsRef.current = [];
      return;
    }

    const currentIds = Array.from(serviceList.keys()).map(Number);
    const prev = prevServiceIdsRef.current;
    const added = currentIds.filter(id => !prev.includes(id));

    if (added.length > 0) {
      setServiceToggleFields(prevSel =>
        Array.from(new Set([...prevSel, ...added.map(String)])),
      );
    }

    prevServiceIdsRef.current = currentIds;
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

  const [isServicesDrawerOpen, setIsServicesDrawerOpen] = useState(false);

  const allServices =
    (serviceList &&
      Array.from(serviceList.values()).filter(i => Boolean(i.title))) ||
    ([] as ServiceLike[]);

  const timeSlot = {
    services: serviceToggleFields
      .map(id => serviceList?.get(Number(id)))
      .filter(Boolean) as ServiceLike[],
  };

  const addService = (service: ServiceLike) => {
    const idStr = String(service.id);
    setServiceToggleFields(prev =>
      prev.includes(idStr) ? prev : [...prev, idStr],
    );
  };

  const removeService = (id: number) => {
    setServiceToggleFields(prev => prev.filter(x => x !== String(id)));
  };

  return (
    <Drawer
      open={open}
      onClose={records.finishEdit}
      noBodyStyles
      modal={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      repositionInputs={false}
    >
      <DrawerPortal>
        <DrawerContent className="pb-unified-safe bg-blurable backdrop-blur-3xl">
          <DrawerHeader>
            <div className="flex items-center justify-between w-full">
              <div className="">
                <DrawerTitle className="hidden">
                  Редактирование записи
                </DrawerTitle>
                <DrawerDescription className="hidden">
                  Измените данные или удалите запись
                </DrawerDescription>
              </div>

              <div className="flex-1 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const form = formRef.current;
                    form?.requestSubmit();
                  }}
                  className="ml-auto"
                >
                  Сохранить
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (!recordFields?.id) return;
                    if (!confirm('Удалить запись?')) return;
                    records.deleteOne(recordFields.id);
                  }}
                >
                  <TrashIcon />
                </Button>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-auto content-grid">
            <form
              className="flex flex-col gap-4"
              id="edit-record-card"
              ref={formRef}
              onSubmit={e => {
                e.preventDefault();

                const servicesSelected = Array.from(serviceToggleFields, v =>
                  Number(v),
                );

                records.store.editableRightNow.setState({
                  fields: produce(recordFields, draft => {
                    if (!draft) return;
                    draft.serviceIdList = new Set(servicesSelected);
                    draft.sign = sign;
                  }),
                });

                records.finishEdit();
              }}
            >
              <div className="flex flex-col gap-1">
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
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Выберите услугу</DrawerTitle>
                        {/* <DrawerDescription>
                          Добавьте услуги в окно календаря
                        </DrawerDescription> */}
                      </DrawerHeader>

                      {/* <div className="flex overflow-x-auto gap-2 px-4 pb-3 border-b">
                        <Button
                          variant={
                            selectedCategory === null ? 'default' : 'outline'
                          }
                          size="sm"
                          className="shrink-0"
                          onClick={() => setSelectedCategory(null)}
                        >
                          Все
                        </Button>
                        {categories.map(category => (
                          <Button
                            key={category}
                            variant={
                              selectedCategory === category
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            className="shrink-0"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div> */}

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

                        <div className="space-y-2">
                          {allServices.map((service: ServiceLike) => {
                            const isAdded = timeSlot.services.some(
                              s => s.id === service.id,
                            );
                            return (
                              <div
                                key={service.id}
                                className={`p-3 border rounded-lg active:scale-[0.98] transition-all ${
                                  isAdded
                                    ? 'bg-gray-50 border-gray-300'
                                    : 'bg-white active:bg-gray-50'
                                }`}
                                onClick={() => !isAdded && addService(service)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h3 className="text-gray-900">
                                        {service.title ?? service.name}
                                      </h3>
                                      <Badge
                                        variant="secondary"
                                        className="shrink-0"
                                      >
                                        {service.category ?? '—'}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {service.duration
                                          ? `${service.duration} мин`
                                          : '—'}
                                      </span>
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
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>

                {timeSlot.services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Услуги не добавлены</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeSlot.services.map((service: ServiceLike) => (
                      <div
                        key={service.id}
                        className="flex items-start gap-3 p-3 bg-white border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-gray-900">
                              {service.title ?? service.name}
                            </h3>
                            <Badge variant="outline" className="shrink-0">
                              {service.category ?? '—'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {service.duration
                                ? `${service.duration} мин`
                                : '—'}
                            </span>
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
                          onClick={() => removeService(service.id)}
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

          <DrawerFooter>
            <Button
              variant="outline"
              onClick={records.store.editableRightNow.getState().reset}
            >
              закрыть
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};
