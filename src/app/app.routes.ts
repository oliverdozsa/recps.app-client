import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';

export const routes: Routes = [
  {path: "home", component: HomeComponent},
  {path: "**", component: PageNotFoundComponent},
];
