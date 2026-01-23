import { Schema } from 'effect';

import { Service } from '@/schemas';

export { beautyItems } from '@/schemas';

export const Itself = Service;

export const ItselfWithOptionalId = Schema.Struct({
  ...Itself.fields,
  id: Schema.optional(Schema.Number),
});

export const ItselfWithoutId = Itself.omit('id');
