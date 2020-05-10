import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';

import { NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Platform, NavController } from '@ionic/angular';

@Component({
  selector: 'app-my-profiles',
  templateUrl: './my-profiles.page.html',
  styleUrls: ['./my-profiles.page.scss'],
})
export class MyProfilesPage implements OnInit {

  profiles: any;
  active = '#f0ffec;';
  inactive = '#efecff;';
  
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

      this.myProfiles();
    }
  }

  myProfiles() {

    this.global.showSortLoading();

    let data = {user_id: this.global.currentUser.id}
    this.apis.myProfiles(data).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        
        if (result.status) {
          this.profiles = result.data;
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
    this.navCtrl.navigateForward('/profile-detail/'+profile_id);
  }

  editProfile(profile_id) {
    this.navCtrl.navigateForward('/edit-profile/'+profile_id);
  }

}
