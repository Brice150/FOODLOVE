import { IngredientUnity } from '../enums/ingredient-unity';

export interface Ingredient {
  name: string;
  quantity: number;
  unity: IngredientUnity;
  checked?: boolean;
}
