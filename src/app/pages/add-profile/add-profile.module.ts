import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AddProfilePage } from './add-profile.page';
import { SharedModule } from '../../components/share.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AddProfilePage
      }
    ])
  ],
  declarations: [AddProfilePage]
})
export class AddProfilePageModule {}
