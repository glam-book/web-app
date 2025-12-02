import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Mail, Phone } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePreview({ profile, loading }: { profile?: Record<string, unknown>, loading?: boolean }) {
    const [isContactsOpen, setIsContactsOpen] = useState(false);

    const safeName = String(profile?.name ?? '') + ' ' + String(profile?.lastName ?? '');
    const initials = safeName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((s: string) => s[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    if (loading)
        return <>Loading...</>

    return (
        <>
            <div className="flex items-center gap-2"
                onClick={() => setIsContactsOpen(true)}
            >
                <div className="relative flex items-center">
                    {profile?.profileIcon ? (
                        <img
                            src={String(profile.profileIcon)}
                            alt="avatar"
                            className="w-9 h-9 rounded-full object-cover border-2 border-white/20"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border-2 border-white/20">
                            {initials}
                        </div>
                    )}
                </div>
            </div>

            <Drawer open={isContactsOpen} onOpenChange={setIsContactsOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Контакты</DrawerTitle>
                        <DrawerDescription>
                            Информация о профиле
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-4 py-3 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xl">
                                {initials}
                            </div>
                            <div>
                                <div className="text-gray-900">{String(profile?.name ?? '') + ' ' + String(profile?.lastName ?? '')}</div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            {Boolean(profile?.phone) && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <div className="text-xs text-gray-600">Телефон</div>
                                        <div className="text-gray-900">{String(profile?.phone ?? '')}</div>
                                    </div>
                                </div>
                            )}

                            {Boolean(profile?.email) && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <div className="text-xs text-gray-600">Email</div>
                                        <div className="text-gray-900">{String(profile?.email)}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DrawerFooter className="border-t">
                        <Button variant="outline" onClick={() => setIsContactsOpen(false)} className="w-full">
                            закрыть
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}