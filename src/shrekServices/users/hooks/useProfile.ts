import { owner, users } from '@/shrekServices';

export const useProfile = () => {
  const { calendarId } = owner.store();
  const userResult = users.useGet(calendarId);

  return userResult;
};
