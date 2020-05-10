import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SortlistPageRoutingModule } from './sortlist-routing.module';

import { SortlistPage } from './sortlist.page';
import { SharedModule } from '../../components/share.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    SortlistPageRoutingModule
  ],
  declarations: [SortlistPage]
})
export class SortlistPageModule {}
