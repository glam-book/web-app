import { http } from '@/services';

export const getMe = http.liveClient('info/me');
