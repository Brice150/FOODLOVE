import { RecipeType } from '../enums/recipe-type';
import { Ingredient } from './ingredient';
import { Step } from './step';

export interface Recipe {
  id: string;
  name: string;
  price?: number;
  partNumber: number;
  type: RecipeType;
  duration: number;
  picture: string | null;
  ingredients: Ingredient[];
  steps: Step[];
  userId?: string;
}
