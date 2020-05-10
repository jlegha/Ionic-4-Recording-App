import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaticPagePage } from './static-page.page';

const routes: Routes = [
  {
    path: '',
    component: StaticPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaticPagePageRoutingModule {}
