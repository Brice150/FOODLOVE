import { IngredientCategory } from '../enums/ingredient-category';
import { IngredientUnity } from '../enums/ingredient-unity';

export interface Ingredient {
  name: string;
  quantity: number;
  unity: IngredientUnity;
  category: IngredientCategory;
  checked?: boolean;
}
