import { Routes } from '@angular/router';
import { EditerRecetteComponent } from './editer-recette/editer-recette.component';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { ProfilComponent } from './profil/profil.component';
import { RecettesComponent } from './recettes/recettes.component';
import { RecetteCompleteComponent } from './recette-complete/recette-complete.component';
import { CoursesComponent } from './courses/courses.component';

export const routes: Routes = [
  { path: '', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: 'profil', component: ProfilComponent, canActivate: [userGuard] },
  {
    path: 'recettes/:type',
    component: RecettesComponent,
    canActivate: [userGuard],
  },
  {
    path: 'recettes/:type/:id',
    component: RecetteCompleteComponent,
    canActivate: [userGuard],
  },
  {
    path: 'editer-recette',
    component: EditerRecetteComponent,
    canActivate: [userGuard],
  },
  {
    path: 'editer-recette/:id',
    component: EditerRecetteComponent,
    canActivate: [userGuard],
  },
  { path: 'courses', component: CoursesComponent, canActivate: [userGuard] },
  { path: '**', redirectTo: 'recettes/selection', pathMatch: 'full' },
];
