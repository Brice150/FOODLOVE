import { Meal } from './meal';

export interface Menu {
  id: string;
  meals: Meal[];
  userId?: string;
}
