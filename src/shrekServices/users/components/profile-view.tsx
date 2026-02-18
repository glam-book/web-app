import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';

import { useProfile } from '@/shrekServices/users';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

export const ProfileView = () => {
  const { data: profile, isLoading } = useProfile();
  const fullName = `${profile?.name ?? ''} ${profile?.lastName ?? ''}`.trim();
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((s: string) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div className={cn('flex items-center gap-1 text-sm font-bold indent-2')}>
        <span className="followable animate-follow">
          <div
            className="flex items-center gap-2"
            onClick={() => !isLoading && setIsContactsOpen(true)}
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
          </div>
        </span>
        <div className="empty:hidden">
          {profile?.login ??
            profile?.name ??
            (import.meta.env.DEV && 'ggamabuntattt')}
        </div>
      </div>

      <Drawer open={isContactsOpen} onOpenChange={setIsContactsOpen}>
        <DrawerContent className="pb-unified-safe">
          <DrawerHeader>
            <DrawerTitle>Контакты</DrawerTitle>
            <DrawerDescription>Информация о профиле</DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-3 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xl">
                {initials}
              </div>
              <div>
                <div className="text-gray-900">{fullName}</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {profile?.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-xs text-gray-600">Телефон</div>
                    <div className="text-gray-900">{profile.phone}</div>
                  </div>
                </div>
              )}

              {profile?.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-xs text-gray-600">Email</div>
                    <div className="text-gray-900">{profile.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DrawerFooter>
            <Button
              variant="outline"
              onClick={() => setIsContactsOpen(false)}
              className="w-full"
            >
              Закрыть
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
