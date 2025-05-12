// Utility function to replace lodash's omit
export function omit<T extends Record<string, any>>(obj: T, ...keys: (keyof T)[]): Partial<T> {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (!keys.includes(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }