import { useContext, useEffect } from 'react';
import {Arbitrary, FastCheck, Schema} from 'effect';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { services } from '@/shrekServices';
import { Itself as Service } from '@/shrekServices/services/schemas';
import { MapFromArrayWithIdsOrUndefined } from '@/transformers';

import { CardContext } from './CardContext';

const arb = Arbitrary.make(Service);
const sample = FastCheck.sample(arb, 10);

const serviceListWithInOrderId = Schema.decodeUnknownSync(
  MapFromArrayWithIdsOrUndefined(Service),
)(sample.map((i, idx) => ({ ...i, id: idx })));
console.log({ serviceListWithInOrderId });


export const Badges = () => {
  const { fields } = useContext(CardContext);
  const { data: serviceList = serviceListWithInOrderId } = services.useGet();

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
