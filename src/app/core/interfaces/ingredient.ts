import { IngredientCategory } from '../enums/ingredient-category';

export interface Ingredient {
  id?: string;
  name: string;
  quantity: string;
  category: IngredientCategory;
  checked?: boolean;
  userId?: string;
}
