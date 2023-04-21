import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './components/search/search.component';
import { AddNewItemComponent } from './components/add-new-item/add-new-item.component';

const routes: Routes = [
  { path: 'addnewitem', component: AddNewItemComponent },
  { path: 'search', component: SearchComponent },
  { path: 'search/:searchKey', component: SearchComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
