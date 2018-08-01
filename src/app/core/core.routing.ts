import {Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {AccountComponent} from "./account/account.component";
import {JoinComponent} from "./join/join.component";
import {AccountGuard} from "../shared/guards/account.guard";

export const coreRoutes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [
      AccountGuard
    ]
  },
  {
    path: 'join',
    component: JoinComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
