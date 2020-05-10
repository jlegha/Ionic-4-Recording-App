import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchFiltersPageRoutingModule } from './search-filters-routing.module';

import { SearchFiltersPage } from './search-filters.page';
import { SharedModule } from '../../components/share.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    SearchFiltersPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SearchFiltersPage]
})
export class SearchFiltersPageModule {}
