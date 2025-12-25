import { useContext } from 'react';

import { Badge } from '@/components/ui/badge';
import { services } from '@/shrekServices';
import { Itself as Service } from '@/shrekServices/services/schemas';

import { CardContext } from './CardContext';

export const Badges = () => {
  const { fields } = useContext(CardContext);
  const { data: serviceList } = services.useGet();

  return (
    <ul>
      {Array.from(serviceList ?? (new Map() as NonNullable<typeof serviceList>))
        .filter(([, service]) => fields.serviceIdList.has(service.id))
        .map(([, service]) => (
          <li key={service.id}>{service.title}</li>
        ))}
    </ul>
  );
};
