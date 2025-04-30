import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'lobby',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/lobby/lobby.component').then(m => m.LobbyComponent)
  },
  {
    path: 'game/:roomId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/game-room/game-room.component').then(m => m.GameRoomComponent)
  },
  {
    path: 'games/hearts/:roomId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/games/hearts/hearts.component').then(m => m.HeartsComponent)
  },
  {
    path: 'games/solitaire',
    loadComponent: () => import('./pages/games/solitaire/solitaire.component').then(m => m.SolitaireComponent)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
