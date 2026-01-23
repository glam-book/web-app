import { useContext, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { services } from '@/shrekServices';
import { Itself as Service } from '@/shrekServices/services/schemas';

import { CardContext } from './CardContext';

export const Badges = () => {
  const { fields } = useContext(CardContext);
  const { data: serviceList } = services.useGet();

  return (
    <ul className="self-start flex items-center gap-0.5">
      {Array.from(serviceList ?? (new Map() as NonNullable<typeof serviceList>))
        .filter(([, service]) => fields.serviceIdList.has(service.id))
        .map(([, service]) => (
          <li key={service.id} className="flex items-center">
            <Badge>{service.title}</Badge>
          </li>
        ))}
    </ul>
  );
};
