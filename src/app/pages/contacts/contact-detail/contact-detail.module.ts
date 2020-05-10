import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactDetailPageRoutingModule } from './contact-detail-routing.module';

import { ContactDetailPage } from './contact-detail.page';
import { ReportContactComponent } from './report-contact/report-contact.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactDetailPageRoutingModule
  ],
  declarations: [ContactDetailPage, ReportContactComponent],
  entryComponents: [ReportContactComponent]
})
export class ContactDetailPageModule {}
