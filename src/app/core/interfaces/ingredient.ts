import { IngredientUnity } from '../enums/ingredient-unity';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unity: IngredientUnity;
}
