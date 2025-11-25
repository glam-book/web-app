import { produce } from 'immer';
import { CirclePlus, PlusIcon, SaveIcon, TrashIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { records, services } from '@/shrekServices';

const snapPoints = [0.5, 1];
const iconSize = 25;

export const EditRecordModal = () => {
  const { fields: recordFields } = records.store.editableRightNow();
  const isCardSelected = Boolean(recordFields);
  const open = isCardSelected;

  const { data: serviceList } = services.useGet();

  const isServiceListReallyNotEmpty =
    serviceList &&
    Array.from(serviceList).filter(([, i]) => Boolean(i.title)).length > 0;

  const makeServiceToggleDefaultFields = () =>
    recordFields?.serviceIdList
      ? Array.from(recordFields.serviceIdList, String)
      : [];

  const [serviceToggleFields, setServiceToggleFields] = useState<string[]>(
    makeServiceToggleDefaultFields,
  );

  const [sign, setSign] = useState<string>(String(recordFields?.sign || ''));
  const maxSignLength = 800;
  const formRef = useRef<HTMLFormElement | null>(null);
  const prevServiceIdsRef = useRef<number[]>([]);

  const [snap, setSnap] = useState<number | null | string>(snapPoints[0]);

  useEffect(() => {
    setSnap(snapPoints[0]);
  }, [recordFields?.id]);

  useEffect(() => {
    setServiceToggleFields(makeServiceToggleDefaultFields);
  }, [recordFields?.id]);

  // If a new service appears in the service list (created elsewhere), auto-select it
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
        <DrawerContent className="min-h-[80dvh] pb-4 bg-blurable backdrop-blur-3xl">
          <DrawerHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <DrawerTitle>Редактирование записи</DrawerTitle>
                <DrawerDescription className="hidden">
                  Измените данные или удалите запись
                </DrawerDescription>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const form = formRef.current;
                    if (!form) return;
                    // modern browsers: requestSubmit
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (typeof form.requestSubmit === 'function')
                      form.requestSubmit();
                    else
                      form.dispatchEvent(
                        new Event('submit', {
                          bubbles: true,
                          cancelable: true,
                        }),
                      );
                  }}
                >
                  <SaveIcon size={iconSize} />
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (!recordFields?.id) return;
                    if (!confirm('Удалить запись?')) return;
                    records.deleteOne(recordFields.id);
                  }}
                >
                  <TrashIcon size={iconSize} />
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
              <div className="flex gap-2 items-start">
                <div className="flex items-center gap-2 w-full">
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <Button
                        aria-label="Выбрать сервисы"
                        variant="outline"
                        className="flex-1 text-sm text-left"
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="inline-flex gap-2 flex-wrap items-center">
                          {serviceToggleFields.length === 0 && (
                            <span className="text-muted-foreground">
                              Выберите сервисы
                            </span>
                          )}
                          {serviceToggleFields.map(id => {
                            const svc = serviceList?.get(Number(id));
                            if (!svc) return null;
                            return (
                              <Badge key={id} className="font-mono font-bold">
                                {svc.title}
                              </Badge>
                            );
                          })}
                        </span>
                      </Button>
                    </ContextMenuTrigger>

                    <ContextMenuPortal>
                      <ContextMenuContent>
                        {serviceList &&
                          Array.from(serviceList)
                            .filter(([, i]) => Boolean(i.title))
                            .map(([, i]) => (
                              <ContextMenuCheckboxItem
                                key={i.id}
                                checked={serviceToggleFields.includes(
                                  String(i.id),
                                )}
                                onCheckedChange={checked => {
                                  setServiceToggleFields(prev => {
                                    const idStr = String(i.id);
                                    if (checked)
                                      return Array.from(
                                        new Set([...prev, idStr]),
                                      );
                                    return prev.filter(x => x !== idStr);
                                  });
                                }}
                              >
                                <span className="flex-1">{i.title}</span>
                                <span className="text-muted-foreground">
                                  {new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    maximumFractionDigits: 0,
                                  }).format(i.price)}
                                </span>
                              </ContextMenuCheckboxItem>
                            ))}

                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            services.startEdit();
                          }}
                        >
                          <PlusIcon />
                          Создать новый сервис
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenuPortal>
                  </ContextMenu>

                  <Button
                    aria-label="Добавить сервис"
                    size="icon"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation();
                      services.startEdit();
                    }}
                    className="ml-1"
                  >
                    <CirclePlus />
                  </Button>
                </div>

                {!isServiceListReallyNotEmpty && (
                  <div className="text-sm text-muted-foreground">
                    Нет доступных сервисов
                  </div>
                )}
              </div>

              {/* Selected services info container */}
              <div className="mt-2">
                <div className="border rounded-lg p-3 bg-white/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Выбранные сервисы</div>
                    <div className="text-xs text-muted-foreground">
                      {serviceToggleFields.length} шт.
                    </div>
                  </div>

                  {serviceToggleFields.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Пока ничего не выбрано
                    </div>
                  )}

                  {serviceToggleFields.length > 0 && (
                    <div className="space-y-2">
                      {serviceToggleFields.map(id => {
                        const svc = serviceList?.get(Number(id));
                        if (!svc) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between gap-2 p-2 bg-white/30 rounded-md"
                          >
                            <div className="flex-1">
                              <div className="font-semibold">{svc.title}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {svc.id}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="font-mono">
                                {new Intl.NumberFormat('ru-RU', {
                                  style: 'currency',
                                  currency: 'RUB',
                                  maximumFractionDigits: 0,
                                }).format(svc.price)}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Удалить сервис ${svc.title}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  setServiceToggleFields(prev =>
                                    prev.filter(x => x !== id),
                                  );
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex justify-end font-bold pt-2">
                        Итог:{' '}
                        <span className="ml-2">
                          {new Intl.NumberFormat('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                            maximumFractionDigits: 0,
                          }).format(
                            Array.from(serviceToggleFields).reduce(
                              (sum, id) => {
                                const svc = serviceList?.get(Number(id));
                                return sum + (svc?.price || 0);
                              },
                              0,
                            ),
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="sign">Комментарий</Label>
                <Textarea
                  id="sign"
                  name="sign"
                  value={sign}
                  onChange={e =>
                    setSign(e.target.value.slice(0, maxSignLength))
                  }
                  rows={4}
                  placeholder="Коротко опишите запись, примечания для мастера..."
                  className="resize-y bg-[aliceblue]"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {sign.length}/{maxSignLength}
                </div>
              </div>

              <div className="mt-auto sticky bottom-0 pt-2 bg-gradient-to-t from-white/60"></div>
            </form>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};
