import { IngredientCategory } from '../enums/ingredient-category';

export interface Ingredient {
  name: string;
  quantity: string;
  category: IngredientCategory;
  checked?: boolean;
}
