import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SortlistPage } from './sortlist.page';

const routes: Routes = [
  {
    path: '',
    component: SortlistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SortlistPageRoutingModule {}
