import { useLocation } from 'react-router';

import { useModals, useParams } from '@/router';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import * as services from '@/shrekServices/services';

export default function EditService() {
  const location = useLocation();
  const params = useParams('/calendar/:id');
  const modals = useModals();
  const { data = new Map() } = services.useGet(params.id);

  return (
    <Drawer open onClose={modals.close}>
      <DrawerContent className="h-[100dvh]">
        <DrawerHeader>
          <DrawerTitle>MODAL {location.pathname}</DrawerTitle>
          <DrawerDescription>(privet)</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col flex-1">
          <section>EDIT SERVICE RIHT HERE</section>
          <ul>
            {Array.from(data, ([, item]) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
