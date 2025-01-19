import { RecipeType } from '../enums/recipe-type';
import { Ingredient } from './ingredient';

export interface Recipe {
  id: string;
  name: string;
  type: RecipeType;
  duration: number;
  picture: string | null;
  ingredients: Ingredient[];
  steps: string[];
}
