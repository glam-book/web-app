import { useState, useEffect } from 'react';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { records, services } from '@/shrekServices';

const snapPoints = [0.5, 1];

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

  const [serviceToggleFields, setServiceToggleFields] = useState(
    makeServiceToggleDefaultFields,
  );

  const [snap, setSnap] = useState<number | null | string>(snapPoints[0]);

  useEffect(() => {
    setSnap(snapPoints[0]);
  }, [recordFields?.id]);

  useEffect(() => {
    setServiceToggleFields(makeServiceToggleDefaultFields);
  }, [recordFields?.id]);

  useEffect(() => {
    const form = document.forms.namedItem('edit-record-card');
    const textarea = form?.querySelector<HTMLTextAreaElement>('[name="sign"]');
    if (!textarea) return;
    textarea.defaultValue = String(recordFields?.sign);
    form?.reset();
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
            <DrawerTitle>HELLOW</DrawerTitle>
            <DrawerDescription>(privet)</DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-auto content-grid">
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
                <ToggleGroup
                  type="multiple"
                  value={serviceToggleFields}
                  onValueChange={setServiceToggleFields}
                  className="overflow-auto overscroll-contain flex-1 empty:hidden"
                  variant="outline"
                >
                  {serviceList &&
                    Array.from(serviceList)
                      .filter(([, i]) => Boolean(i.title))
                      .map(([, i]) => (
                        <ToggleGroupItem
                          value={String(i.id)}
                          type="button"
                          className="basis-auto font-mono font-bold border-destructive data-[state=on]:bg-[deepskyblue] data-[state=on]:text-white"
                          name={String(i.id)}
                          key={i.id}
                        >
                          {i.title}
                        </ToggleGroupItem>
                      ))}
                </ToggleGroup>

                <Label>
                  <Button
                    className="bg-[aliceblue]"
                    type="button"
                    aria-label="Add new service"
                    size="icon"
                    onClick={() => services.startEdit()}
                    variant="outline"
                  >
                    <PlusIcon />
                  </Button>
                  {!isServiceListReallyNotEmpty && (
                    <span className="text-base">Добавьте новый сервис</span>
                  )}
                </Label>
              </div>

              <Textarea
                cols={2}
                name="sign"
                className="resize-none bg-[aliceblue]"
                defaultValue={recordFields?.sign}
              />

              <Button className="mt-auto sticky bottom-0" type="submit">
                Сохранить
              </Button>
            </form>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};
