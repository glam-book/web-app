import { http } from '@/services';

export const getMe = http.liveClient('/api/v1/info/me');
