export function removeFieldsFromObject<T extends object, K extends keyof T>(
  object: T,
  fields: readonly K[]
): Omit<T, K> {
  const copy = { ...object };
  for (const field of fields) delete copy[field];
  return copy;
}
