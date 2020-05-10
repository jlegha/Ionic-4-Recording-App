import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';

import { NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Platform, NavController, Events  } from '@ionic/angular';
import { AppLauncher, AppLauncherOptions } from '@ionic-native/app-launcher/ngx';


declare var RazorpayCheckout: any;

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  contacts: any;
  isContactPayment: boolean = false;
  
  
  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    public navCtrl: NavController,
    public apis: ApisService,
    public events: Events,
    public appLauncher: AppLauncher,

  ) {
    this.isContactPayment = this.global.currentUser.isContactPayment;
    console.log(this.isContactPayment);
    this.isContactPayment = true;
    events.subscribe('isContactPayment', () => {
      console.log('isContactPayment variable is updated. So please update local storage.')

      // update current user local storage
      let currentStoreage = this.global.currentUser;
      currentStoreage.isContactPayment = true;
      this.global.setCurrentUser(currentStoreage);
      this.events.publish('currentUser');
      this.isContactPayment = true;
    });

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

  sendToCall() {
    var options: AppLauncherOptions = {
      packageName: "com.google.android.dialer"
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
      alert(JSON.stringify(err));
    })
  }

  ngOnInit() {
    this.getContacts();
    this.translate.setDefaultLang(this.global.language);
  }

  ionViewWillEnter() {
    // this.getContacts();
  }

  getContacts() {

    this.global.showSortLoading();

    let data = {}
    this.apis.getContacts(data).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        
        if (result.status) {
          this.contacts = result.data;
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

  onSearchChange(e) {
    let value = e.detail.value;
    console.log(value);

    if (value == '') {
      // this.offset = 0;
      this.getContacts();
      return;
    }

    this.apis.findContact(value).subscribe((result: any) => {
      this.contacts = result.data;
      console.log(this.contacts);
    }, err => {
      this.contacts = [];
    })
  }

  gotoContactDetail(id) {
    this.navCtrl.navigateForward('/contacts/contact-detail/' + id);
  }

  editContact(id) {
    this.navCtrl.navigateForward('/contacts/contact-edit/' + id);
  }

  makeContactPayment() {
    let global = this.global;
    let apis = this.apis;
    let amount = (this.global.contact_amount * 100);
    let globalEvents = this.events;

    let user_info = {
      name: this.global.currentUser.name,
      phone: this.global.currentUser.mobile,
      email: this.global.currentUser.email,
      image: this.global.currentUser.image
    }

    console.log('user_info::::::', user_info)

    var options = {
      description: 'Dictionary Payment',
      image: user_info.image,
      currency: global.currency,
      key: global.razorPayCredentials.key_id,
      amount: amount,
      name: user_info.name,
      prefill: {
        email: user_info.email,
        contact: user_info.phone,
        name: user_info.name
      }
    }

    console.log('options:::::::', options)
    var successCallback = function (success) {
      console.log('success: ', success)

      global.showloading();

      let params = {
        user_id: global.currentUser.id,
        transaction_id: success.razorpay_payment_id,
        amount: (amount / 100),
      };
      apis.makeContactPayment(params).subscribe(
        (result: any) => {

          console.log(result);
          global.hideloading();
          global.showMsg(result.message);
          globalEvents.publish('isContactPayment'); // update global variable
        },
        (err: any) => {
          global.hideloading();
          global.showMsg(err);
          console.log(err);
        });
    }

    var cancelCallback = function (error) {
      console.error('error: ', error)
      global.showMsg(error.description);
    }

    RazorpayCheckout.on('payment.success', successCallback)
    RazorpayCheckout.on('payment.cancel', cancelCallback)
    RazorpayCheckout.open(options)
  }

}



