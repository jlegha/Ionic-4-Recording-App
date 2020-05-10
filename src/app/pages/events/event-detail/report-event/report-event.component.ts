import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { GlobalProvider } from 'src/providers/globals/globals';
import { ApisService } from 'src/providers/apis/apis';

@Component({
  selector: 'app-report-event',
  templateUrl: './report-event.component.html',
  styleUrls: ['./report-event.component.scss'],
})
export class ReportEventComponent implements OnInit {
  @Input() actionId; 
  description: string;
  constructor(
    private modalCtrl: ModalController, 
    public global: GlobalProvider,
    private apis: ApisService
    ) { 
    // console.log(this.actionId);
  }

  ngOnInit() {}

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    console.log(this.actionId);
    let params = {
      user_id: this.global.currentUser.id,
      action_id: this.actionId,
      action_type: 'Event',
      description: this.description
    }
    console.log(params);
    this.apis.reportEvent(params).subscribe((resData: any) => {
      console.log('Server Response:::::::', resData);
      if (resData.status) {
        this.global.showMsg(resData.message);
      } else {
        this.global.showError(resData.message);
      }
    });

    form.reset();
    this.modalCtrl.dismiss(params);
  }


  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

}
