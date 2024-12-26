import { IngredientCategory } from '../enums/ingredient-category';

export interface Ingredient {
  name: string;
  category: IngredientCategory;
  quantity: number;
  unity: string;
}
