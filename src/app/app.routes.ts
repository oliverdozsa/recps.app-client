import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';
import {AboutComponent} from './pages/about/about.component';
import {MenuComponent} from './pages/menu/menu.component';

export const routes: Routes = [
  {path: "home", component: HomeComponent},
  {path: "about", component: AboutComponent},
  {path: "menu", component: MenuComponent},
  {path: "", redirectTo: "/home", pathMatch: "full"},
  {path: "**", component: PageNotFoundComponent},
];
