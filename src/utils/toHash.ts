export function toHash(string: string) {
  let hash = 0; // Инициализация хеш-значения

  if (string.length == 0) return hash; // Обработка пустой строки

  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i); // Получение ASCII-кода текущего символа
    hash = (hash << 5) - hash + char; // Основная операция хеширования
    hash = hash & hash; // Преобразование в 32-битное целое число
  }

  return hash;
}
