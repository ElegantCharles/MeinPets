import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import { colors, parseIso } from '../theme';

export const calendarSupported = Platform.OS !== 'web';

const EVENT_HOUR = 9;
const EVENT_DURATION_MINUTES = 60;
const ALARM_MINUTES_BEFORE = 24 * 60;
const GOOGLE_ACCOUNT_TYPE = 'com.google';
const LOCAL_CALENDAR_NAME = 'MeinPets';

export interface BoosterCalendarInput {
  petName: string;
  treatmentName: string;
  boosterDate: string;
  intervalDays: number | null;
}

export type BoosterCalendarResult =
  | { status: 'created' | 'exists'; calendarTitle: string }
  | { status: 'denied'; canAskAgain: boolean };

function recurrenceFor(intervalDays: number | null): Calendar.RecurrenceRule | null {
  if (!intervalDays || intervalDays <= 0) return null;
  if (intervalDays % 365 === 0) {
    return { frequency: Calendar.Frequency.YEARLY, interval: intervalDays / 365 };
  }
  if (intervalDays % 7 === 0) {
    return { frequency: Calendar.Frequency.WEEKLY, interval: intervalDays / 7 };
  }
  return { frequency: Calendar.Frequency.DAILY, interval: intervalDays };
}

function eventWindow(isoDate: string) {
  const day = parseIso(isoDate);
  if (!day) throw new Error('La fecha del refuerzo no es válida.');
  const year = day.getFullYear();
  const month = day.getMonth();
  const date = day.getDate();
  const start = new Date(year, month, date, EVENT_HOUR, 0);
  return {
    start,
    end: new Date(start.getTime() + EVENT_DURATION_MINUTES * 60000),
    dayStart: new Date(year, month, date),
    dayEnd: new Date(year, month, date + 1),
  };
}

function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago';
  } catch {
    return 'America/Santiago';
  }
}

async function ensureAccess(): Promise<{ granted: boolean; canAskAgain: boolean }> {
  let response = await Calendar.getCalendarPermissions();
  if (!response.granted && response.canAskAgain) {
    response = await Calendar.requestCalendarPermissions();
  }
  return { granted: response.granted, canAskAgain: response.canAskAgain };
}

function rank(calendar: Calendar.ExpoCalendar): number {
  const google = String(calendar.source?.type) === GOOGLE_ACCOUNT_TYPE;
  const owner = calendar.accessLevel === Calendar.CalendarAccessLevel.OWNER;
  if (google && calendar.isPrimary) return 0;
  if (google && owner) return 1;
  if (google) return 2;
  if (calendar.isPrimary) return 3;
  if (owner && !calendar.source?.isLocalAccount) return 4;
  return 5;
}

async function pickTargetCalendar(calendars: Calendar.ExpoCalendar[]): Promise<Calendar.ExpoCalendar> {
  const writable = calendars
    .filter((calendar) => calendar.allowsModifications)
    .sort((a, b) => rank(a) - rank(b));
  if (writable.length > 0) return writable[0];
  return Calendar.createCalendar({
    title: LOCAL_CALENDAR_NAME,
    name: LOCAL_CALENDAR_NAME,
    color: colors.teal,
    entityType: Calendar.EntityTypes.EVENT,
    source: { isLocalAccount: true, name: LOCAL_CALENDAR_NAME, type: Calendar.SourceType.LOCAL },
    ownerAccount: LOCAL_CALENDAR_NAME,
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

async function findExistingCalendarTitle(
  calendars: Calendar.ExpoCalendar[],
  title: string,
  dayStart: Date,
  dayEnd: Date
): Promise<string | null> {
  const visible = calendars.filter((calendar) => calendar.isVisible !== false);
  if (visible.length === 0) return null;
  const events = await Calendar.listEvents(
    visible.map((calendar) => calendar.id),
    dayStart,
    dayEnd
  );
  const match = events.find((event) => event.title === title);
  if (!match) return null;
  return visible.find((calendar) => calendar.id === match.calendarId)?.title ?? title;
}

export async function addBoosterToCalendar(
  input: BoosterCalendarInput
): Promise<BoosterCalendarResult> {
  if (!calendarSupported) {
    throw new Error('El calendario del teléfono solo está disponible en la app móvil.');
  }

  const access = await ensureAccess();
  if (!access.granted) {
    return { status: 'denied', canAskAgain: access.canAskAgain };
  }

  const window = eventWindow(input.boosterDate);
  const title = `${input.treatmentName} de ${input.petName}`;

  try {
    const calendars = await Calendar.getCalendars();

    const existingTitle = await findExistingCalendarTitle(
      calendars,
      title,
      window.dayStart,
      window.dayEnd
    );
    if (existingTitle) {
      return { status: 'exists', calendarTitle: existingTitle };
    }

    const target = await pickTargetCalendar(calendars);
    await target.createEvent({
      title,
      startDate: window.start,
      endDate: window.end,
      allDay: false,
      timeZone: deviceTimeZone(),
      notes: `Refuerzo de ${input.treatmentName} para ${input.petName}. Creado desde MeinPets.`,
      alarms: [{ relativeOffset: -ALARM_MINUTES_BEFORE, method: Calendar.AlarmMethod.ALERT }],
      recurrenceRule: recurrenceFor(input.intervalDays),
    });
    return { status: 'created', calendarTitle: target.title };
  } catch {
    throw new Error('No se pudo agregar al calendario. Intenta de nuevo.');
  }
}
