import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MyProfilesPage } from './my-profiles.page';
import { SharedModule } from '../../components/share.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: MyProfilesPage
      }
    ])
  ],
  declarations: [MyProfilesPage]
})
export class MyProfilesPageModule {}
