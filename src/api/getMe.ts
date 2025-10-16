import { rest } from '@/services';

export const getMe = rest.client('info/me');
