import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../../providers/globals/globals";
import { ApisService } from "../../../../providers/apis/apis";
import { Storage } from '@ionic/storage';

import { NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Platform, NavController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ReportContactComponent } from './report-contact/report-contact.component';
import { AppLauncher, AppLauncherOptions } from '@ionic-native/app-launcher/ngx';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.page.html',
  styleUrls: ['./contact-detail.page.scss'],
})
export class ContactDetailPage implements OnInit {

  contact: any = {};
  contact_id: any = 0;
  editable: boolean = false;
  isContactPayment: boolean = true;

  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    public navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    public apis: ApisService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingController: LoadingController,
    public appLauncher: AppLauncher
  ) {
    this.isContactPayment = this.global.currentUser.isContactPayment;
    console.log(this.isContactPayment);
    this.isContactPayment = true;

    this.contact_id = this.activatedRoute.snapshot.paramMap.get('id');
    console.log(this.contact_id);
    this.getContactDetails(this.contact_id);
  }

  whatsapp() {
    var options: AppLauncherOptions = {
      packageName: "com.whatsapp"
    }
    this.appLauncher.canLaunch(options).then((launched: boolean) => {
      if(launched) {
        this.appLauncher.launch(options).then(() => {

        }, (err) => {
          alert(JSON.stringify(err));
        })
      } else {
        alert('Unable to open app');
      }
    }, (err) => {
      alert(JSON.stringify(err));
    })
  }
  // com.android.phone
  sendToCall() {
    var options: AppLauncherOptions = {
      packageName: "com.google.android.dialer",
      
    }
    this.appLauncher.canLaunch(options).then((launched: boolean) => {
      if(launched) {
        this.appLauncher.launch(options).then(() => {
        }, (err) => {
          alert(JSON.stringify(err));
        })
      } else {
        alert('Unable to open app');
      }
    }, (err) => {
      this.onePlusPhone();
      // alert(JSON.stringify(err));
    });
  }

  onePlusPhone() {
    var options: AppLauncherOptions = {
      packageName: "com.android.phone",
      
    }
    this.appLauncher.canLaunch(options).then((launched: boolean) => {
      if(launched) {
        this.appLauncher.launch(options).then(() => {
        }, (err) => {
          alert(JSON.stringify(err));
        })
      } else {
        alert('Unable to open app');
      }
    }, (err) => {
      // this.onePlus();
      alert(JSON.stringify(err));
    });
  }
  // com.oneplus.mms
  messageBox() {
    var options: AppLauncherOptions = {
      packageName: "com.google.android.apps.messaging"
    }
    this.appLauncher.canLaunch(options).then((launched: boolean) => {
      if(launched) {
        this.appLauncher.launch(options).then(() => {

        }, (err) => {
          alert(JSON.stringify(err));
        })
      } else {
        alert('Unable to open app');
      }
    }, (err) => {
      this.onePlusMessage();
      // alert(JSON.stringify(err));
    })
  }

  onePlusMessage() {
    var options: AppLauncherOptions = {
      packageName: "com.oneplus.mms"
    }
    this.appLauncher.canLaunch(options).then((launched: boolean) => {
      if(launched) {
        this.appLauncher.launch(options).then(() => {

        }, (err) => {
          alert(JSON.stringify(err));
        })
      } else {
        alert('Unable to open app');
      }
    }, (err) => {
      // this.onePlusMessage();
      alert(JSON.stringify(err));
    })
  }

  ngOnInit() {

    this.translate.setDefaultLang(this.global.language);
  }

  ionViewWillEnter() {

  }

  reportContact(id) {
    this.modalCtrl
      .create({
        component: ReportContactComponent,
        componentProps: { actionId: this.contact.id }
      })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      });
  }

  getContactDetails(contact_id) {

    this.global.showSortLoading();

    this.apis.getContactDetails(contact_id).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        
        if (result.status) {
          this.contact = result.data;
          if (this.contact.user_id == this.global.currentUser.id) {
            this.editable = true;
            console.log('true;;;;;;');
          }
          console.log('this.contact:::', this.contact)
        } else {
          this.global.showMsg(result.message);
        }
      },
      (err: any) => {
        this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
    });
  }

  editContact(id) {
      this.navCtrl.navigateForward('/contacts/edit-contact/' + id);
  }

  async presentConfirm() {
    const alert = await this.alertCtrl.create({
      header: 'Delete this contact?',
      message: 'Do you want to delete this contact from your device?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'ok',
          handler: () => {
            this.deleteContact(this.contact.id);
            console.log('ok clicked');
          }
        }
      ]
    });
    await alert.present();
  }

  deleteContact(id) {
    console.log(this.global.currentUser.id); 
    let params = {
      user_id: this.global.currentUser.id,
      id: id
    }
    this.apis.deleteContact(params).subscribe(resData => {
      console.log(resData);
    });
    this.navCtrl.navigateBack('contacts');
  }

}
