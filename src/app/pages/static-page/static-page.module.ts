import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaticPagePageRoutingModule } from './static-page-routing.module';

import { StaticPagePage } from './static-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaticPagePageRoutingModule
  ],
  declarations: [StaticPagePage]
})
export class StaticPagePageModule {}
