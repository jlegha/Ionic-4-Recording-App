import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { TabsComponent } from '../components/tabs/tabs.component';

@NgModule({
    imports: [
        CommonModule, 
        IonicModule
    ],
    declarations: [
        TabsComponent
    ],
    exports: [
        TabsComponent
    ]
})
export class SharedModule { }
