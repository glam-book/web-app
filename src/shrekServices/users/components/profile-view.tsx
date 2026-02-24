import { openLink } from '@tma.js/sdk-react';

import { useProfile } from '@/shrekServices/users';
import { cn } from '@/lib/utils';

export const ProfileView = () => {
  const { data: profile } = useProfile();

  const fullName = `${profile?.name ?? ''} ${profile?.lastName ?? ''}`.trim();

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((s: string) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const tgContact = profile?.contacts?.find(contact =>
    Boolean(contact.tgUserName),
  );

  return (
    <>
      <button
        className={cn('flex items-center gap-1 text-sm font-bold indent-2')}
        type="button"
        disabled={!tgContact?.tgUserName}
        onClick={() => {
          openLink(`https://t.me/${tgContact?.tgUserName}`);
        }}
      >
        <div className="relative flex items-center">
          {profile?.profileIcon ? (
            <img
              src={String(profile.profileIcon)}
              alt="avatar"
              className="size-10 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="size-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border-2 border-white/20">
              {initials}
            </div>
          )}
        </div>

        <span
          className={cn('empty:hidden', tgContact?.tgUserName && 'text-brand underline')}
        >
          {profile?.login ??
            profile?.name ??
            (import.meta.env.DEV && 'ggamabuntattt')}
        </span>
      </button>
    </>
  );
};
