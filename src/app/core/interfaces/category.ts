import { IngredientCategory } from '../enums/ingredient-category';
import { Ingredient } from './ingredient';

export interface Category {
  category: IngredientCategory;
  ingredients: Ingredient[];
}
