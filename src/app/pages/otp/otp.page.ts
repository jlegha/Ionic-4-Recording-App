import { Component, ViewChild, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';
import { NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Platform, NavController, Events } from '@ionic/angular';

@Component({
  selector: 'app-otp',
  templateUrl: 'otp.page.html',
  styleUrls: ['otp.page.scss'],
})
export class OtpPage {

  otp1: any = '';
  otp2: any = '';
  otp3: any = '';
  otp4: any = '';
  timeOutBtn = true;
  counterVal: any;
  mobile: any;
  otp: any = '';
  otpForm: FormGroup;
  allowedKeys: any = [39,48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105];

  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    private storage: Storage,
    private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public apis: ApisService,
    public events: Events
  ) {

    this.otpForm = formBuilder.group({
      otp1: ['', Validators.compose([Validators.pattern('[0-9+]*'), Validators.required])],
      otp2: ['', Validators.compose([Validators.pattern('[0-9+]*'), Validators.required])],
      otp3: ['', Validators.compose([Validators.pattern('[0-9+]*'), Validators.required])],
      otp4: ['', Validators.compose([Validators.pattern('[0-9+]*'), Validators.required])],
    });

  }

  ngOnInit() {

    this.translate.setDefaultLang(this.global.language);

    this.storage.get('mobile').then((val) => {
      this.mobile = val;
    });

  }

  next(nextEl, event) {

    setTimeout( () => {

      let allOTPs = '';

      for(let i=1; i<=4; i++) {
        allOTPs += this.otpForm.value['otp'+i];
      }

      this.otp = allOTPs;

      console.log(allOTPs.length)
      if(allOTPs.length < 4 && nextEl != null && this.allowedKeys.includes(event.keyCode)) {
        nextEl.setFocus();
      }
      else if(nextEl == null) {
          
          if(allOTPs.length === 4) {
            // this.OTPVerified(this.mobile, allOTPs);
            this.OTPVerified();
          }
        }
      }, 10);
  }

  back(preEl, currentEl, event) {

    if(event.keyCode === 8) {
      if(currentEl.value == '')
        preEl.setFocus();
    }
    else if(event.keyCode === 37) {
      preEl.setFocus();
    }
  }

  timeoutOnButtonClicked(retrytype) {

    this.counterVal = 30;
    this.timeOutBtn = false;
    console.log('btn clicked');

    setTimeout(() => {
      this.timeOutBtn = true;
    }, 30000);
    console.log(this.timeOutBtn);

    let timer = setInterval(() => {
      if (this.counterVal != 0) {
        this.counterVal -= 1;
      } else {
        clearInterval(timer);
      }
    }, 1000);

    this.global.showloading();
    console.log(retrytype);

    this.apis.resendOTP({mobile: this.mobile, retrytype: retrytype}).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        this.global.showMsg(result.message);

        if (result.status) {
          //this.navCtrl.setRoot('SignupPage');
        }
      },
      (err: any) => {
        this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
      });
  }

  OTPVerified() {

    let allOTPs = '';
    for(let i=1; i<=4; i++) {
      allOTPs += this.otpForm.value['otp'+i];
    }
    this.otp = allOTPs;

    this.global.showloading();

    this.apis.verifyOTP({ mobile: this.mobile, otp: this.otp })
      .subscribe((result: any) => {

        console.log('result:', result);
        this.global.hideloading();

        if (result.status) {

          // set user information
          this.storage.set('token', result.data.token);
          this.storage.set('user', result.data.user);

          // set user information 
          this.global.setCurrentUser(result.data.user);
          
          this.events.publish('currentUser');

          this.storage.remove('mobile');

          // this.navCtrl.navigateForward('/');
          this.navCtrl.navigateRoot('/');
        } else {
          this.global.showMsg(result.message);
        }
      },
        error => {
          console.error(error.message);
          this.global.hideloading();
          this.global.showMsg(error);
        });
  }

}
