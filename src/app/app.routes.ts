import { Routes } from '@angular/router';
import { EditRecipeComponent } from './edit-recipe/edit-recipe.component';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { ProfileComponent } from './profile/profile.component';
import { RecipeComponent } from './recipe/recipe.component';
import { ShoppingComponent } from './shopping/shopping.component';
import { RecipesComponent } from './recipes/recipes.component';
import { AiComponent } from './ai/ai.component';

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
  {
    path: 'edit-recipe',
    component: EditRecipeComponent,
    canActivate: [userGuard],
  },
  {
    path: 'edit-recipe/:id',
    component: EditRecipeComponent,
    canActivate: [userGuard],
  },
  { path: 'ai', component: AiComponent, canActivate: [userGuard] },
  { path: 'shopping', component: ShoppingComponent, canActivate: [userGuard] },
  { path: '**', redirectTo: 'recipes/selection', pathMatch: 'full' },
];
