import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';

import { NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Platform, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.page.html',
  styleUrls: ['./profile-detail.page.scss'],
})
export class ProfileDetailPage implements OnInit {

  currentUser: any = {};
  profile: any = {};
  profile_id: any = 0;
  active: string = 'radio-1';

  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    public navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    public apis: ApisService
  ) {

    this.profile_id = this.activatedRoute.snapshot.paramMap.get('profile_id');;
    this.profileDetailForViewOnly();
  }

  ngOnInit() {

    this.currentUser = this.global.currentUser;
    this.translate.setDefaultLang(this.global.language);
  }

  ionViewWillEnter() {

  }

  accordionClicked(accordionID) {
    this.active = accordionID;
  }

  profileDetailForViewOnly() {

    this.global.showSortLoading();

    let data = {profile_id: this.profile_id}
    this.apis.profileDetailForViewOnly(data).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        
        if (result.status) {
          // this.profile = JSON.stringify(result.data.basic);
          this.profile = result.data;
          console.log('this.profile:::', this.profile)
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

  sendEmail(profile_id) {
    console.log('clicked');
    // if(this.profile_id) {
    //   this.global.showloading();
    //   let params = {profile_id: this.profile_id, end_profile_id: profile_id, user_id: this.global.currentUser.id};
    //   this.apis.sendEmailToProfile(params).subscribe(
    //     (result: any) => {

    //       console.log(result);
    //       this.global.hideloading();
    //       this.global.showMsg(result.message);
    //     },
    //     (err: any) => {
    //       this.global.hideloading();
    //       this.global.showMsg(err);
    //       console.log(err);
    //   });
    // } else {
    //   this.global.showMsg('Please select profile first');
    // }
  }

  sortlist(profile_id) {
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
  }

  interest(profile_id) {
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
  }

  message(receiver_id, profile_id) {
    this.navCtrl.navigateForward('/chat/'+receiver_id+'/'+profile_id);
  }

}

