import { DayOfWeek } from '../enums/day-of-week';
import { Meal } from './meal';

export interface MealCategory {
  dayOfWeek: DayOfWeek;
  meals: Meal[];
}
