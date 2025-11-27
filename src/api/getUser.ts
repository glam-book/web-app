import { rest } from '@/services';

export const getUser = (id: number | string) => rest.client(`users/${id}`);
