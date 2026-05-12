import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';
import {AboutComponent} from './pages/about/about.component';
import {MenuComponent} from './pages/menu/menu.component';
import {NewMenuComponent} from './pages/menu/new-menu/new-menu.component';
import {ViewEditMenuComponent} from './pages/menu/view-edit-menu/view-edit-menu.component';

export const routes: Routes = [
  {path: "home", component: HomeComponent},
  {path: "about", component: AboutComponent},
  {path: "menu", component: MenuComponent},
  {path: "menu/new", component: NewMenuComponent},
  {path: "menu/:id", component: ViewEditMenuComponent},
  {path: "", redirectTo: "/home", pathMatch: "full"},
  {path: "**", component: PageNotFoundComponent},
];
