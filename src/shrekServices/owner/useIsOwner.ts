import { useGet as useGetMe } from '@/shrekServices/me';
import { store as useOwnerStore } from '@/shrekServices/owner/store';

export const useIsOwner = () => {
  const { calendarId } = useOwnerStore();
  const meResult = useGetMe();

  console.debug({
    isOwner: meResult.data?.id === Number(calendarId),
    calendarId,
  });

  return { ...meResult, isOwner: meResult.data?.id === Number(calendarId) };
};
