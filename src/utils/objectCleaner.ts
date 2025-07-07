export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && value.trim() === '')
    ) {
      // @ts-ignore – we know key is keyof T
      cleaned[key] = value;
    }
  });
  return cleaned;
} 