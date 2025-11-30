import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Mail, Phone } from 'lucide-react';
import { useState } from 'react';

type UserProfile = {
  name?: string | null;
  lastName?: string | null;
  profileIcon?: string | null;
  specialty?: string | null;
  phone?: string | null;
  email?: string | null;
};

export default function ProfilePreview({ profile }: { profile: UserProfile }) {
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const safeName = (profile.name ?? '') + ' ' + (profile.lastName ?? '');
  const initials = safeName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((s: string) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          {profile.profileIcon ? (
            <img 
              src={profile.profileIcon} 
              alt="avatar" 
              className="w-9 h-9 rounded-full object-cover border-2 border-white/20" 
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border-2 border-white/20">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-white leading-tight">
            {profile.name} {profile.lastName}
          </div>
          <button 
            onClick={() => setIsContactsOpen(true)}
            className="text-xs text-blue-100 opacity-90 hover:opacity-100 leading-tight"
          >
            {profile.specialty || 'Мастер'}
          </button>
        </div>
      </div>

      <Drawer open={isContactsOpen} onOpenChange={setIsContactsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Контакты</DrawerTitle>
            <DrawerDescription>
              Информация о мастере
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-3 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xl">
                {initials}
              </div>
              <div>
                <div className="text-gray-900">{profile.name} {profile.lastName}</div>
                <div className="text-gray-600 text-sm">{profile.specialty || 'Мастер'}</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {profile.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-xs text-gray-600">Телефон</div>
                    <div className="text-gray-900">{profile.phone}</div>
                  </div>
                </div>
              )}

              {profile.email && (
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

          <DrawerFooter className="border-t">
            <Button variant="outline" onClick={() => setIsContactsOpen(false)} className="w-full">
              Закрыть
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}


// function ProfilePreview({ profile, loading }: { profile?: Record<string, unknown> | undefined; loading?: boolean }) {
//   // profile is a loosely-typed object coming from the server; handle defensively
//   const initials = profile
//     ? ((profile.name || profile.login || '') + ' ' + (profile.lastName || '')).trim()
//       .split(' ')
//       .map((s: string) => s[0])
//       .join('')
//       .slice(0, 2)
//     : '';

//   return (
//     <div className="flex items-center gap-2">
//       <div className="relative flex items-center">
//         {loading ? (
//           <div className="w-8 h-8 rounded-full bg-muted-foreground/40 animate-pulse" />
//         ) : profile?.profileIcon ? (
//           <img src={String(profile.profileIcon)} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
//         ) : (
//           <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-muted-foreground">
//             {initials || 'U'}
//           </div>
//         )}
//       </div>

//       <div className="min-w-0">
//         <div className="text-sm font-semibold leading-none">
//           {loading ? '...' : profile ? `${profile.name ?? profile.login ?? 'User'}` : '—'}
//         </div>

//         {/* small details clickable - open dialog to see contacts */}
//         <Dialog>
//           <DialogTrigger asChild>
//             <button className="text-xs text-muted-foreground opacity-80 hover:opacity-100">See contacts</button>
//           </DialogTrigger>

//           <DialogContent>
//             <DialogTitle>Contacts</DialogTitle>
//             <DialogDescription>
//               {Array.isArray(profile?.contacts) && (profile.contacts as unknown[]).length ? (
//                 <ul className="mt-2 space-y-2">
//                   {Array.isArray(profile.contacts)
//                     ? (profile.contacts as unknown[]).map((c, idx) => (
//                       <li key={idx} className="text-sm">
//                         {typeof c === 'object' ? JSON.stringify(c) : String(c)}
//                       </li>
//                     ))
//                     : null}
//                 </ul>
//               ) : (
//                 <div className="text-sm text-muted-foreground mt-2">No contacts</div>
//               )}
//             </DialogDescription>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// }
