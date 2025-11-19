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
    recordId?: number | string,
    contactTarget = 'TG',
) =>
    useQuery({
        queryKey: [`${resource}/pending`, recordId, contactTarget],
        enabled: Boolean(recordId),
        queryFn: () => getPendingDetails(recordId as number | string, contactTarget),
    });
