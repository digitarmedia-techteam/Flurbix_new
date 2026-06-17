import { env } from '../config/env';
import { getEventsForDay } from './googleCalendarService';

/**
 * Generate all theoretical time slot labels for a business day.
 * e.g. ["10:00 AM", "10:30 AM", ..., "05:30 PM"]
 * Driven by CALENDAR_BUSINESS_START, CALENDAR_BUSINESS_END, CALENDAR_SLOT_DURATION_MINUTES env vars.
 */
export function generateAllSlots(): string[] {
  const slots: string[] = [];
  const { CALENDAR_BUSINESS_START, CALENDAR_BUSINESS_END, CALENDAR_SLOT_DURATION_MINUTES } = env;

  let currentMinutes = CALENDAR_BUSINESS_START * 60;
  const endMinutes   = CALENDAR_BUSINESS_END * 60;

  while (currentMinutes < endMinutes) {
    const h24    = Math.floor(currentMinutes / 60);
    const min    = currentMinutes % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12    = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    slots.push(`${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`);
    currentMinutes += CALENDAR_SLOT_DURATION_MINUTES;
  }

  return slots;
}

/** Convert a "10:30 AM" label to minutes since midnight */
function slotToMinutes(slot: string): number {
  const [timePart, period] = slot.split(' ');
  const [h, m] = timePart.split(':').map(Number);
  let hour = h;
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour * 60 + m;
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr + 'T12:00:00Z').getUTCDay();
  return day === 0 || day === 6;
}

function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return new Date(dateStr + 'T00:00:00Z') < today;
}

/**
 * Determine which slots are occupied for a given day.
 * A slot is occupied when any calendar event overlaps its time window.
 */
async function getOccupiedSlots(dateStr: string): Promise<string[]> {
  const events   = await getEventsForDay(dateStr);
  const allSlots = generateAllSlots();
  const { CALENDAR_SLOT_DURATION_MINUTES } = env;
  const occupied: string[] = [];

  for (const slot of allSlots) {
    const slotStart = slotToMinutes(slot);
    const slotEnd   = slotStart + CALENDAR_SLOT_DURATION_MINUTES;

    for (const event of events) {
      if (!event.start.dateTime) continue;

      const evStart    = new Date(event.start.dateTime);
      const evEnd      = new Date(event.end.dateTime);
      const evStartMin = evStart.getUTCHours() * 60 + evStart.getUTCMinutes();
      const evEndMin   = evEnd.getUTCHours()   * 60 + evEnd.getUTCMinutes();

      // Overlap: [slotStart, slotEnd) ∩ [evStart, evEnd) ≠ ∅
      if (slotStart < evEndMin && slotEnd > evStartMin) {
        occupied.push(slot);
        break;
      }
    }
  }

  return occupied;
}

/**
 * Returns available slot labels for a specific date.
 * Excludes: weekends, past dates, occupied slots, past slots on today.
 */
export async function getAvailableSlots(dateStr: string): Promise<string[]> {
  if (isPastDate(dateStr) || isWeekend(dateStr)) return [];

  const allSlots = generateAllSlots();
  const occupied = await getOccupiedSlots(dateStr);

  // On today, also filter out slots that have already passed (+ 30-min buffer)
  const now      = new Date();
  const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  const isToday  = dateStr === todayStr;
  const nowMins  = now.getUTCHours() * 60 + now.getUTCMinutes() + 30; // 30-min buffer

  return allSlots.filter(slot => {
    if (occupied.includes(slot)) return false;
    if (isToday && slotToMinutes(slot) <= nowMins) return false;
    return true;
  });
}

/**
 * Double-booking protection: verify a specific slot is still available
 * immediately before creating the calendar event.
 */
export async function isSlotAvailable(dateStr: string, slotLabel: string): Promise<boolean> {
  const available = await getAvailableSlots(dateStr);
  return available.includes(slotLabel);
}
