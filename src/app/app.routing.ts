import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayerComponent } from './player/player.component';
import { RemoteComponent } from './remote/remote.component';

const appRoutes: Routes = [
  { path: '', component: PlayerComponent },
  { path: 'remote/:id', component: RemoteComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

