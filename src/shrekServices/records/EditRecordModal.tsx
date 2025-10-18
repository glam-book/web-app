import { useState, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { PlusIcon } from 'lucide-react';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerPortal,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { ButtonGroup } from '@/components/ui/button-group';
import { records, services } from '@/shrekServices';

const snapPoints = ['230px', 1];

export const EditRecordModal = () => {
  const { fields: recordFields } = records.store.editableRightNow();
  const isCardSelected = Boolean(recordFields);

  const { data: serviceList } = services.useGet();

  const isServiceListReallyNotEmpty =
    serviceList &&
    Array.from(serviceList).filter(([, i]) => Boolean(i.title)).length > 0;

  const makeServiceToggleFields = () =>
    new Map(
      Array.from(serviceList ?? new Map(), ([k]) => [
        k,
        Boolean(recordFields?.serviceIdList.has(k)),
      ]),
    );

  const [serviceToggleFields, setServiceToggleFields] = useState(
    makeServiceToggleFields,
  );

  const [snap, setSnap] = useState<number | null | string>(snapPoints[0]);

  useEffect(() => {
    setSnap(snapPoints[0]);
  }, [recordFields?.id]);

  useEffect(() => {
    setServiceToggleFields(makeServiceToggleFields);
  }, [recordFields?.id]);

  useEffect(() => {
    const form = document.forms.namedItem('edit-record-card');
    const textarea = form?.querySelector<HTMLTextAreaElement>('[name="sign"]');
    if (!textarea) return;
    textarea.defaultValue = String(recordFields?.sign);
    form?.reset();
  }, [recordFields?.id]);

  return (
    <Drawer
      open={isCardSelected}
      onClose={records.finishEdit}
      noBodyStyles
      modal={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      repositionInputs={false}
    >
      <DrawerPortal>
        <DrawerContent className="min-h-[80dvh] pb-4">
          <DrawerHeader>
            <DrawerTitle>HELLOW</DrawerTitle>
            <DrawerDescription>(privet)</DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 content-grid">
            <form
              className="flex flex-col gap-4"
              id="edit-record-card"
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const sign = fd.get('sign') as string;
                const services = Array.from(
                  e.currentTarget.querySelectorAll<HTMLButtonElement>(
                    '[data-state="on"]',
                  ),
                  b => Number(b.name),
                );

                records.store.editableRightNow.setState({
                  fields: produce(recordFields, draft => {
                    if (!draft) return;
                    draft.serviceIdList = new Set(services);
                    draft.sign = sign;
                  }),
                });

                records.finishEdit();
              }}
            >
              <div className="flex gap-1">
                <ButtonGroup className="overflow-auto empty:hidden">
                  {serviceList &&
                    Array.from(serviceList)
                      .filter(([, i]) => Boolean(i.title))
                      .map(([, i]) => (
                        <Toggle
                          className="basis-auto"
                          pressed={serviceToggleFields.get(i.id)}
                          onPressedChange={v =>
                            setServiceToggleFields(prev =>
                              produce(prev, draft => draft.set(i.id, v)),
                            )
                          }
                          name={String(i.id)}
                          key={i.id}
                          variant="outline"
                        >
                          {i.title}
                        </Toggle>
                      ))}
                </ButtonGroup>

                <Label>
                  <Button
                    type="button"
                    aria-label="Add new service"
                    size="icon"
                    onClick={() => services.startEdit()}
                    variant="outline"
                  >
                    <PlusIcon />
                  </Button>
                  {!isServiceListReallyNotEmpty && (
                    <span>Добавьте новый сервис</span>
                  )}
                </Label>
              </div>

              <Textarea name="sign" defaultValue={recordFields?.sign} />

              <Button className="mt-auto" type="submit">
                Сохранить
              </Button>
            </form>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};
