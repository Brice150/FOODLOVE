import { Recipe } from './recipe';

export interface User {
  email: string;
  username: string;
  password: string;
  role: string;
  prefersDarkMode: boolean;
  recipes: Recipe[];
}
