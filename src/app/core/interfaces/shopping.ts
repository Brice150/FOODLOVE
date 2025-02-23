import { Ingredient } from './ingredient';

export interface Shopping {
  id: string;
  ingredients: Ingredient[];
  userId?: string;
}
