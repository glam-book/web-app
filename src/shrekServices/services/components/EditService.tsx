import { produce } from 'immer';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { services } from '@/shrekServices';

export function EditService(props: React.ComponentProps<typeof Drawer>) {
  const { fields } = services.store.editableRightNow();

  return (
    <Drawer
      open={Boolean(fields)}
      repositionInputs={false}
      onClose={services.resetEdit}
      {...props}
    >
      <DrawerContent className="pb-unified-safe backdrop-blur-3xl">
        <DrawerHeader>
          <DrawerTitle>Сервис</DrawerTitle>
          <DrawerDescription className="hidden">
            service edit for
          </DrawerDescription>
        </DrawerHeader>

        <div className="content-grid flex-1">
          <form
            className="flex flex-col gap-4"
            onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);

              services.store.editableRightNow.setState({
                fields: produce(fields, draft => {
                  if (draft === undefined) return;
                  draft.title = fd.get('title') as string;
                  const priceCandidate = parseFloat(fd.get('price') as string);
                  draft.price = Number.isNaN(priceCandidate)
                    ? 0
                    : priceCandidate;
                }),
              });

              services.finishEdit();
            }}
            action=""
          >
            <Label className="flex-col items-start">
              <Input
                name="title"
                type="text"
                placeholder="Название"
                defaultValue={fields?.title}
                required
              />
            </Label>

            <Label className="flex-col items-start">
              <Input
                name="price"
                type="text"
                placeholder="Цена в реблях"
                defaultValue={fields?.price ? fields.price : ''}
                inputMode="numeric"
              />
            </Label>

            <Button className="mt-auto" type="submit">
              Сохранить
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
