import { Component, OnInit, Input } from '@angular/core';
import { ApisService } from 'src/providers/apis/apis';
import { GlobalProvider } from 'src/providers/globals/globals';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-report-contact',
  templateUrl: './report-contact.component.html',
  styleUrls: ['./report-contact.component.scss'],
})
export class ReportContactComponent implements OnInit {
  @Input() actionId;
  description: string;
  constructor(
    private modalCtrl: ModalController, 
    public global: GlobalProvider,
    private apis: ApisService
  ) { }

  ngOnInit() {}

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    console.log(this.actionId);
    let params = {
      user_id: this.global.currentUser.id,
      action_id: this.actionId,
      action_type: 'Contact',
      description: this.description
    }
    console.log(params);
    this.apis.reportContact(params).subscribe((resData: any) => {
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
