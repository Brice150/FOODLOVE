import { IngredientCategory } from '../enums/ingredient-category';
import { Ingredient } from './ingredient';

export interface Shopping {
  id?: string;
  category: IngredientCategory;
  ingredients: Ingredient[];
  userId?: string;
}
