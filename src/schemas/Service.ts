import { Schema } from 'effect';
import { faker } from '@faker-js/faker';

export const beautyItems = [
  'Наращивание ресниц',
  'Контурная пластика губ',
  'Чистка лица (комбинированная)',
  'Мезотерапия кожи головы',
  'Биоревитализация',
  'Лазерная эпиляция',
  'Пилинг PRX-T33',
  'LPG-массаж',
  'Ботулинотерапия (Ботокс)',
  'Архитектура и окрашивание бровей',
  'Классический массаж лица',
];

export const Service = Schema.Struct({
  id: Schema.NonNegativeInt,
  title: Schema.NonEmptyString.annotations({
    arbitrary: () => fc => {
      return fc
        .constant(null)
        .map(() => faker.helpers.arrayElement(beautyItems));
    },
  }),
  price: Schema.optional(
    Schema.Int.pipe(Schema.nonNegative()).annotations({
      arbitrary: () => fc => {
        return fc
          .constant(null)
          .map(() => Number(faker.commerce.price({ dec: 0 })));
      },
    }),
  ),
});
