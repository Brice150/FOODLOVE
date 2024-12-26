import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ConnectComponent } from './connect/connect.component';
import { adminGuard } from './core/guards/admin.guard';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { ProfileComponent } from './profile/profile.component';
import { RecipesComponent } from './recipes/recipes.component';

export const routes: Routes = [
  { path: '', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [userGuard] },
  { path: 'recipes', component: RecipesComponent, canActivate: [userGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'recipes', pathMatch: 'full' },
];
