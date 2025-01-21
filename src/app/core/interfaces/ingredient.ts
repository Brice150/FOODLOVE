import { IngredientCategory } from '../enums/ingredient-category';
import { IngredientUnity } from '../enums/ingredient-unity';

export interface Ingredient {
  name: string;
  category: IngredientCategory;
  quantity: number;
  unity: IngredientUnity;
}
