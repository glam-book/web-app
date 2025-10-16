import { useLocation } from 'react-router';

import { useParams } from '@/router';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import * as services from '@/shrekServices/services';

export function EditService(props: React.ComponentProps<typeof Drawer>) {
  const location = useLocation();
  const params = useParams('/calendar/:id');
  // const modals = useModals();
  const { data = new Map() } = services.useGet(params.id);

  return (
    <Drawer {...props}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>MODAL OPEND FROM?: {location.pathname}</DrawerTitle>
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
