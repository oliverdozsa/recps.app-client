import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';
import {AboutComponent} from './pages/about/about.component';
import {MenuComponent} from './pages/menu/menu.component';
import {NewMenuComponent} from './pages/menu/new-menu/new-menu.component';
import {ViewEditMenuComponent} from './pages/menu/view-edit-menu/view-edit-menu.component';
import {
  NewRecipeCollectionComponent
} from './pages/recipe-collections/new-recipe-collection/new-recipe-collection.component';
import {RecipeCollectionsComponent} from './pages/recipe-collections/recipe-collections.component';
import {
  ViewEditRecipeCollectionComponent
} from './pages/recipe-collections/view-edit-recipe-collection/view-edit-recipe-collection.component';

export const routes: Routes = [
  {path: "home", component: HomeComponent},
  {path: "about", component: AboutComponent},
  {path: "menu", component: MenuComponent},
  {path: "menu/new", component: NewMenuComponent},
  {path: "menu/:id", component: ViewEditMenuComponent},
  {path: "recipe-collections", component: RecipeCollectionsComponent},
  {path: "recipe-collections/new", component: NewRecipeCollectionComponent},
  {path: "recipe-collections/:id", component: ViewEditRecipeCollectionComponent},
  {path: "", redirectTo: "/home", pathMatch: "full"},
  {path: "**", component: PageNotFoundComponent},
];
