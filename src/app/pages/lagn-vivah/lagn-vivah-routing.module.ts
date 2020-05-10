import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LagnVivahPage } from './lagn-vivah.page';

const routes: Routes = [
  {
    path: '',
    component: LagnVivahPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LagnVivahPageRoutingModule {}
