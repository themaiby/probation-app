import { parse } from 'csv-parse/sync';

export const csvParser = <T = Record<string, unknown>>(plain: string): T[] => {
  return parse(plain, { columns: true, skipEmptyLines: true, trim: true });
};
