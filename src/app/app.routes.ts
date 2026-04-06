import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Servers } from './pages/servers/servers';
import { Alerts } from './pages/alerts/alerts';
import { Users } from './pages/users/users';
import { Application } from './pages/application/application';
import { Settings } from './pages/settings/settings';

import { UserDashboard } from './pages/user-dashboard/user-dashboard';
import { UserServers } from './pages/user-servers/user-servers';
import { AlertUser } from './pages/alert-user/alert-user';
import { ApplicationUsers } from './pages/application-users/application-users';
import { UserSettings } from './pages/users-settings/users-settings';
import { UserHistory } from './pages/user-history/user-history';
import { ChatBot } from './pages/chat-bot/chat-bot';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'dashboard', component: AdminDashboard },
  { path: 'servers', component: Servers },
  { path: 'alerts', component: Alerts },
  { path: 'users', component: Users },
  { path: 'application', component: Application },
  { path: 'settings', component: Settings },

  { path: 'user-dashboard', component: UserDashboard },
  { path: 'user-servers', component: UserServers },
  { path: 'user-alerts', component: AlertUser },
  { path: 'user-application', component: ApplicationUsers },
  { path: 'user-settings', component: UserSettings },
  { path: 'user-history', component: UserHistory },

  { path: 'chat-bot', component: ChatBot },

  { path: '**', redirectTo: 'login' }
];