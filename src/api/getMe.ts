import { rest } from '@/services';

export const getMe = rest.client('users/me');
