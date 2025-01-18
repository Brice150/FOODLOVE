import { Routes } from '@angular/router';
import { AjouterRecetteComponent } from './ajouter-recette/ajouter-recette.component';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { ProfilComponent } from './profil/profil.component';
import { RecettesComponent } from './recettes/recettes.component';

export const routes: Routes = [
  { path: '', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: 'profil', component: ProfilComponent, canActivate: [userGuard] },
  {
    path: 'recettes/:type',
    component: RecettesComponent,
    canActivate: [userGuard],
  },
  {
    path: 'ajouter-recette',
    component: AjouterRecetteComponent,
    canActivate: [userGuard],
  },
  { path: '**', redirectTo: 'recettes/selection', pathMatch: 'full' },
];
