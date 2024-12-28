import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ConnectComponent } from './connect/connect.component';
import { adminGuard } from './core/guards/admin.guard';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { RecettesComponent } from './recettes/recettes.component';
import { ProfilComponent } from './profil/profil.component';

export const routes: Routes = [
  { path: '', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: 'profil', component: ProfilComponent, canActivate: [userGuard] },
  {
    path: 'recettes/:type',
    component: RecettesComponent,
    canActivate: [userGuard],
  },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'recettes/selection', pathMatch: 'full' },
];
