import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';

import { NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Platform, NavController } from '@ionic/angular';

@Component({
  selector: 'app-interest',
  templateUrl: 'interest.page.html',
  styleUrls: ['interest.page.scss'],
})
export class InterestPage {

  header_profiles: any;
  all_profiles: any;
  profiles: any;
  non_filtered_profiles: any;
  profile_id: any = 0;
  active = '2px solid #00a651';
  interest: string = 'sent_button';
  
  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    public navCtrl: NavController,
    public apis: ApisService
  ) {
    
  }

  ngOnInit() {

    this.translate.setDefaultLang(this.global.language);
  }

  ionViewWillEnter() {

    if(this.global.currentUser && this.global.currentUser.id) {

      this.getInterestedProfiles();
    }
  }

  getProfilesBasedForSelectedProfile(profile_id) {

    this.profile_id = profile_id;
    
    let filtred_profiles = this.non_filtered_profiles.filter(function (e) {
      return e.action_profile_id == profile_id;
    });

    this.profiles = filtred_profiles;
  }

  listInterestedProfiles(type) {
    
    if(type == 'received') {
      this.profiles = this.all_profiles.received;
    } else {
      this.profiles = this.all_profiles.sent;
    }

    this.profile_id = 0;
    this.non_filtered_profiles = this.profiles;
  }

  getInterestedProfiles() {

    this.global.showloading();

    let data = {user_id: this.global.currentUser.id}
    this.apis.getInterestedProfiles(data).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        
        if (result.status) {
          this.header_profiles = result.data.header_profiles;
          this.all_profiles = result.data.profiles;
          this.listInterestedProfiles('sent');
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

}