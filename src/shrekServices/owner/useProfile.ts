import { useMemo } from 'react';

import { useGet as useGetMe } from '@/shrekServices/me';
import { store as ownerStore } from '@/shrekServices/owner/store';
import { useGet as useGetUser } from '@/shrekServices/users';
import { useIsOwner } from './useIsOwner';

export const useProfile = () => {
  const meResult = useGetMe();
  const { isOwner } = useIsOwner();

  // calendarId is set from router when entering page
  const { calendarId } = ownerStore.getState();

  const id = useMemo(() => {
    if (isOwner) return meResult.data?.id;

    const n = Number(calendarId);
    return Number.isFinite(n) ? n : undefined;
  }, [isOwner, meResult, calendarId]);

  // call both hooks unconditionally to obey hooks rules
  const userResult = useGetUser(id as number | undefined);

  if (isOwner) {
    return { id, ...meResult };
  }

  return { id, ...userResult };
};
