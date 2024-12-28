import { RecetteType } from '../enums/recette-type';
import { Ingredient } from './ingredient';

export interface Recette {
  name: string;
  type: RecetteType;
  duration: number;
  picture: string;
  creator: string;
  ingredients: Ingredient[];
  steps: string[];
}
