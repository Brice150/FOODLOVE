import { Routes } from '@angular/router';
import { EditRecipeComponent } from './edit-recipe/edit-recipe.component';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { ProfilComponent } from './profil/profil.component';
import { RecettesComponent } from './recettes/recettes.component';
import { RecetteCompleteComponent } from './recette-complete/recette-complete.component';
import { CoursesComponent } from './courses/courses.component';

export const routes: Routes = [
  { path: '', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: 'profile', component: ProfilComponent, canActivate: [userGuard] },
  {
    path: 'recipes/:type',
    component: RecettesComponent,
    canActivate: [userGuard],
  },
  {
    path: 'recipes/:type/:id',
    component: RecetteCompleteComponent,
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
  { path: 'shopping', component: CoursesComponent, canActivate: [userGuard] },
  { path: '**', redirectTo: 'recipes/selection', pathMatch: 'full' },
];
