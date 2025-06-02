import { format } from 'date-fns';

export const getRecords = (date = new Date('2024-12-26')) =>
  fetch(
    `http://localhost:8095/api/v1/record?date=${format(date, 'yyyy-MM-dd')}`,
  ).then((res) => res.json());
