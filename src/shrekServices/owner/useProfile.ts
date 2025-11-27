import { useMemo } from 'react';

import { useGet as useGetMe } from '@/shrekServices/me';
import { store as ownerStore } from '@/shrekServices/owner/store';
import { useGet as useGetUser } from '@/shrekServices/users';
import { useIsOwner } from './useIsOwner';

export const useProfile = () => {
  const { data: me } = useGetMe();
  const { isOwner } = useIsOwner();

  // calendarId is set from router when entering page
  const { calendarId } = ownerStore.getState();

  const id = useMemo(() => (isOwner ? me?.id : Number(calendarId)), [isOwner, me, calendarId]);

  const profileResult = useGetUser(id);

  return { id, ...profileResult };
};
