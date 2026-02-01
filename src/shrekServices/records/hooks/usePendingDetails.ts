import { useQuery } from '@tanstack/react-query';
import { Effect, pipe } from 'effect';

import { rest } from '@/services';
import { tryDecodeInto } from '@/utils';

import { PendingDetails } from '../PendingDetails';

const resource = 'record';

export const getPendingDetails = (
  recordId: number | string,
  contactTarget = 'TG',
) =>
  pipe(
    `${resource}/pending/${recordId}?contactTarget=${contactTarget}`,
    rest.client,
    tryDecodeInto(PendingDetails),
    Effect.runPromise,
  );

export const usePendingDetails = (
  recordId: number | string | undefined,
  contactTarget = 'TG',
  ...rest: Partial<Parameters<typeof useQuery>>
) =>
  useQuery({
    queryKey: [`${resource}/pending`, recordId, contactTarget],
    enabled: recordId !== undefined,
    queryFn: () =>
      getPendingDetails(recordId as number | string, contactTarget).catch(
        error => {
          if (import.meta.env.DEV) {
            return [
              {
                contact: {
                  firstName: 'firstname',
                  lastName: 'lastname',
                  tgUserName: 'gamabunta',
                },
                requestTime: new Date(),
                confirmed: 'CONFIRMED',
                services: [
                  {
                    id: 1,
                    title: 'Nova service',
                    price: 1200,
                    isHourlyPrice: false,
                  },
                ],
              },
              {
                contact: {
                  firstName: 'firstname',
                  lastName: 'lastname',
                  tgUserName: 'gamabunta',
                },
                requestTime: new Date(),
                confirmed: 'EXPIRED',
                services: [
                  {
                    id: 1,
                    title: 'Nova service',
                    price: 1200,
                    isHourlyPrice: false,
                  },
                ],
              },
              {
                contact: {
                  firstName: 'firstname',
                  lastName: 'lastname',
                  tgUserName: 'gamabunta',
                },
                requestTime: new Date(),
                confirmed: 'CREATED',
                services: [
                  {
                    id: 1,
                    title: 'Nova service',
                    price: 1200,
                    isHourlyPrice: false,
                  },
                ],
              },
            ] as typeof PendingDetails.Type;
          }

          throw error;
        },
      ),
    ...rest,
  });
