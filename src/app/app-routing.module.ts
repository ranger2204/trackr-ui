import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { SearchComponent } from './components/search/search.component';
import { GroupsComponent } from './components/groups/groups.component';

import { combineLatest } from 'rxjs';
import { AddNewItemComponent } from './components/add-new-item/add-new-item.component';

const routes: Routes = [
  { path: 'addnewitem', component: AddNewItemComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'search', component: SearchComponent },
  { path: 'search/:searchKey', component: SearchComponent },
  { path: 'groups', component: GroupsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
