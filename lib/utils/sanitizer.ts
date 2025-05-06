export function sanitizeForSQL<T extends Record<string, any>>(obj: T): T {
  for (const key in obj) {
    if (obj[key] === undefined) {
      (obj as any)[key] = null;
    }
  }
  return obj;
}
