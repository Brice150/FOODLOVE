import { RecipeType } from '../enums/recipe-type';
import { Ingredient } from './ingredient';

export interface Recipe {
  name: string;
  type: RecipeType;
  duration: number;
  picture: string;
  creator: string;
  ingredients: Ingredient[];
  steps: string[];
}
