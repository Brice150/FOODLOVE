import { RecipeType } from '../enums/recipe-type';
import { Ingredient } from './ingredient';

export interface Recipe {
  id: number;
  name: string;
  type: RecipeType;
  duration: number;
  picture: string;
  ingredients: Ingredient[];
  steps: string[];
}
