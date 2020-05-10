import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';

import { NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Platform, NavController, Events } from '@ionic/angular';

declare var RazorpayCheckout: any;

@Component({
  selector: 'app-lagn-vivah',
  templateUrl: './lagn-vivah.page.html',
  styleUrls: ['./lagn-vivah.page.scss'],
})
export class LagnVivahPage implements OnInit {

  currentUser: any;
  header_profiles: any;
  profiles: any;
  active_profile: any;
  profile_id: any = 0;
  active = '2px solid #00a651';
  blurImg: string = 'blur-image';
  isPaid: boolean = false;
  
  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    private storage: Storage,
    public navCtrl: NavController,
    public apis: ApisService,
    public events: Events
  ) {

    events.subscribe('isPaid', () => {
      console.log('isPaid variable is updated.')
      this.isPaid = true;
      this.getProfilesBasedResults(this.profile_id);
    });
  }

  ngOnInit() {

    this.translate.setDefaultLang(this.global.language);
  }

  ionViewWillEnter() {

    this.currentUser = this.global.currentUser;

    if(this.global.currentUser && this.global.currentUser.id) {

      this.checkLocalStorageAndCallToAPI();
    }
  }

  makePayment() {

    if(this.profile_id) {

      let global = this.global;
      let profile_id = this.profile_id;
      let apis = this.apis;
      let amount = (this.global.propfile_amount*100);
      let globalEvents = this.events;

      this.active_profile = this.header_profiles.filter(function (e) {
        return e.id == profile_id;
      });

      let profile = {
        name: this.active_profile.name,
        phone: this.global.currentUser.mobile,
        email: this.global.currentUser.email,
        image: this.active_profile.image
      }
      console.log('profile::::::', profile)

      var options = {
        description: 'Profile Payment',
        image: profile.image,
        currency: global.currency,
        key: global.razorPayCredentials.key_id,
        amount: amount,
        name: profile.name,
        prefill: {
          email: profile.email,
          contact: profile.phone,
          name: profile.name
        }
      }
      console.log('options:::::::', options)
      
      var successCallback = function(success) {
        console.log('success: ', success)

        global.showloading();

        let params = {
          user_id: global.currentUser.id,
          profile_id: profile_id,
          transaction_id: success.razorpay_payment_id,
          amount: (amount/100),
        };
        apis.makePayment(params).subscribe(
          (result: any) => {

            console.log(result);
            global.hideloading();
            global.showMsg(result.message);
            globalEvents.publish('isPaid'); // update global variable
          },
          (err: any) => {
            global.hideloading();
            global.showMsg(err);
            console.log(err);
        });
      }
      
      var cancelCallback = function(error) {
        console.error('error: ', error)
        global.showMsg(error.description);
      }
      
      RazorpayCheckout.on('payment.success', successCallback)
      RazorpayCheckout.on('payment.cancel', cancelCallback)
      RazorpayCheckout.open(options)
    } else {
      this.global.showMsg('Please select profile first');
    }
  }

  getProfilesBasedResults(profile_id) {

    this.profile_id = profile_id;

    this.isPaid = false;
    this.blurImg = 'blur-image';
    this.header_profiles.forEach(element => {
      if(element.id == profile_id && element.is_paid) {
        this.isPaid = true;
        this.blurImg = '';
      }
    });

    this.checkLocalStorageAndCallToAPI();
  }

  checkLocalStorageAndCallToAPI() {
    
    this.storage.get('search_filters').then((filters) => {

      let params = filters;
      params.user_id = this.global.currentUser.id;
      if(this.profile_id > 0) {
        params.profile_id = this.profile_id;
      }
      this.getProfiles(params);
    }).catch(err=>{

      let params = {
        user_id: this.global.currentUser.id,
        profile_id: this.profile_id
      };
      this.getProfiles(params);
    });
  }

  getProfiles(params) {
    this.global.showSortLoading();

    this.apis.getProfiles(params).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        
        if (result.status) {
          this.header_profiles = result.data.header_profiles;
          this.profiles = result.data.profiles;
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

  gotoProfileDetail(profile_id) {

    if(this.isPaid) {
      this.navCtrl.navigateForward('/profile-detail/'+profile_id);
    }
  }

  sendEmail(profile_id, email) {
    console.log('clicked');
    window.open(`mailto:${email}`, '_system');
  }

  sortlist(profile_id) {
    if(this.profile_id) {
      this.global.showloading();
      let params = {profile_id: this.profile_id, end_profile_id: profile_id, user_id: this.global.currentUser.id};
      this.apis.sortlistProfile(params).subscribe(
        (result: any) => {

          console.log(result);
          this.global.hideloading();
          this.global.showMsg(result.message);
          if (result.status) {
            //this.profiles = result.data.profiles;
          }
        },
        (err: any) => {
          this.global.hideloading();
          this.global.showMsg(err);
          console.log(err);
      });
    } else {
      this.global.showMsg('Please select profile first');
    }
  }

  interest(profile_id) {
    if(this.profile_id) {
      this.global.showloading();
      let params = {profile_id: this.profile_id, end_profile_id: profile_id, user_id: this.global.currentUser.id};
      this.apis.sendInterestToProfile(params).subscribe(
        (result: any) => {

          console.log(result);
          this.global.hideloading();
          this.global.showMsg(result.message);
          if (result.status) {
            //this.profiles = result.data.profiles;
          }
        },
        (err: any) => {
          this.global.hideloading();
          this.global.showMsg(err);
          console.log(err);
      });
    } else {
      this.global.showMsg('Please select profile first');
    }
  }

  message(receiver_id, profile_id) {
    this.navCtrl.navigateForward('/chat/'+receiver_id+'/'+profile_id);
  }

}

