import { Routes } from '@angular/router';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { MealsComponent } from './meals/meals.component';
import { ProfileComponent } from './profile/profile.component';
import { RecipeComponent } from './recipe/recipe.component';
import { RecipesComponent } from './recipes/recipes.component';
import { ShoppingComponent } from './shopping/shopping.component';

export const routes: Routes = [
  { path: '', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [userGuard] },
  {
    path: 'recipes/:type',
    component: RecipesComponent,
    canActivate: [userGuard],
  },
  {
    path: 'recipes/:type/:id',
    component: RecipeComponent,
    canActivate: [userGuard],
  },
  { path: 'shopping', component: ShoppingComponent, canActivate: [userGuard] },
  { path: 'meals', component: MealsComponent, canActivate: [userGuard] },
  { path: '**', redirectTo: 'recipes/selection', pathMatch: 'full' },
];
