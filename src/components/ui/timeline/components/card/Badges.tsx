import { useContext, useEffect } from 'react';
import { Arbitrary, FastCheck, Schema } from 'effect';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { services } from '@/shrekServices';
import { Itself as Service } from '@/shrekServices/services/schemas';
import { MapFromArrayWithIdsOrUndefined } from '@/transformers';
import { timeLineVariants } from '@/components/ui/timeline/style';

import { CardContext } from './CardContext';

const arb = Arbitrary.make(Service);
const sample = FastCheck.sample(arb, 10);

const serviceListWithInOrderId = Schema.decodeUnknownSync(
  MapFromArrayWithIdsOrUndefined(Service),
)(sample.map((i, idx) => ({ ...i, id: idx })));

export const Badges = () => {
  const { fields } = useContext(CardContext);
  const { data: serviceList = serviceListWithInOrderId } = services.useGet();

  return (
    <ul className="pr-0.5 max-h-full self-start flex items-center gap-0.5">
      {Array.from(serviceList ?? (new Map() as NonNullable<typeof serviceList>))
        .filter(([, service]) => fields.serviceIdList.has(service.id))
        .map(([, service]) => (
          <li
            key={service.id}
            className={cn(
              'max-h-full text-xl flex items-center',
              timeLineVariants({ contentSize: 'sm' }),
            )}
          >
            <Badge className="h-full">{service.title}</Badge>
          </li>
        ))}
    </ul>
  );
};
