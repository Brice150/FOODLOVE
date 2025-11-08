import { DayOfWeek } from '../enums/day-of-week';

export interface Meal {
  id: string;
  name: string;
  dayOfWeek: DayOfWeek;
  checked?: boolean;
  userId?: string;
}
