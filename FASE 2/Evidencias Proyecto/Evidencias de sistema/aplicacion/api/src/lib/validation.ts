import { z } from 'zod';
import { HttpError } from './errors';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_ZONE = 'America/Santiago';

const todayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayIso(): string {
  return todayFormatter.format(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0].message);
  }
  return result.data;
}

export const positiveInt = (message: string) =>
  z.coerce.number({ error: message }).int(message).positive(message);

export const isoDate = (missing: string, invalid: string = missing) =>
  z
    .string({ error: missing })
    .trim()
    .min(1, missing)
    .refine(isRealDate, invalid);

export const optionalText = (max: number, tooLong: string) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : null),
    z.string().max(max, tooLong).nullable()
  );

export const optionalIsoDate = (invalid: string) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value : undefined),
    isoDate(invalid).optional()
  );
