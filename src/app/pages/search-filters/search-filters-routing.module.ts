import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchFiltersPage } from './search-filters.page';

const routes: Routes = [
  {
    path: '',
    component: SearchFiltersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchFiltersPageRoutingModule {}
