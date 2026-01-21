import { ConferenceEvent, EventDay, Session } from '@/types';

/**
 * Helper to create ISO datetime string from date and time
 */
const createDateTime = (dateStr: string, timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

// Sessions for Day 1 (empty for now)
const day1Date = '2026-02-07';
const day1Sessions: Session[] = [];

// Convert date string to ISO format (YYYY-MM-DD -> ISO with time 00:00:00)
const day1DateISO = new Date(day1Date + 'T00:00:00').toISOString();

const day1: EventDay = {
  id: 'day-1',
  date: day1DateISO,
  label: 'Dia 1',
  sessions: day1Sessions,
};

export const pupunhaCode2026SideProjects: ConferenceEvent = {
  id: 'pupunha-code-2026-side-projects',
  name: 'Pupunha Code Meetup — Side Projects',
  theme: 'Side projects, aprendizado e experimentação',
  startDate: '2026-02-07',
  endDate: '2026-02-07',
  location: 'Em breve',
  description:
    'Meetup dedicado à apresentação de side projects desenvolvidos fora do ambiente formal de trabalho.',
  speakers: [],
  days: [day1],
};
