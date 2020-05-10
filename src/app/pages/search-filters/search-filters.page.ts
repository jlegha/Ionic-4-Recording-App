import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';

import { NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Platform, NavController } from '@ionic/angular';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.page.html',
  styleUrls: ['./search-filters.page.scss'],
})
export class SearchFiltersPage implements OnInit {

  profile_id: any = 0;
  profiles: any = [];
  filters: any;
  jobs: any;
  educations: any;
  marital_stats_list: any;
  searchform:FormGroup;
  ages: any;
  heights: any;
  incomes: any;

  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    private storage: Storage,
    private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public apis: ApisService
  ) {
    
  }

  ngOnInit() {

    this.translate.setDefaultLang(this.global.language);

    this.searchform = this.formBuilder.group({
      profile_id: [''],
      looking_for: [''],
      age: [''],
      height: [''],
      income: [''],
      marital_status_ids: [''],
      eduction_ids: [''],
      job_ids: [''],
    });

  }

  ionViewWillEnter() {

    if(this.global.currentUser && this.global.currentUser.id) {

      this.getSearchFilters();
    }
  }

  getSearchFilters() {

    this.global.showloading();

    let data = {user_id: this.global.currentUser.id, profile_id: this.profile_id}
    this.apis.getSearchFilters(data).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        
        if (result.status) {

          this.setValuesToVariables(result);
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

  selectProfile(event) {
    console.log(event.target.value);
    this.profile_id = event.target.value;

    if(this.profile_id > 0) {

      let profile_id = this.profile_id;
      let looking_for = '';
      
      this.profiles.filter(function (e) {
        if(e.id == profile_id) {
          looking_for = e.looking_for;
        }
      });

      this.filters.looking_for = looking_for;
    }
  }

  setValuesToVariables(result) {

    this.filters = result.data.filters;

    let marital_status_ids = [];
    let eduction_ids = [];
    let job_ids = [];

    // convert int to string 
    this.filters.marital_status_ids.forEach(element => {
      marital_status_ids.push(''+element);
    });
    this.filters.eduction_ids.forEach(element => {
      eduction_ids.push(''+element);
    });
    this.filters.job_ids.forEach(element => {
      job_ids.push(''+element);
    });

    // assing values into form field
    this.searchform.patchValue({
      marital_status_ids: marital_status_ids,
      eduction_ids: eduction_ids,
      job_ids: job_ids,
    });

    // set slider values
    this.ages = {lower: this.filters.age_min, upper: this.filters.age_max};
    this.heights = {lower: this.filters.height_min, upper: this.filters.height_max};
    this.incomes = {lower: this.filters.income_min, upper: this.filters.income_max};

    this.jobs = result.data.jobs;
    this.educations = result.data.educations;
    this.marital_stats_list = result.data.marital_stats_list;
    this.profiles = result.data.profiles;
  }

  backToHome() {
    this.navCtrl.navigateBack('lagn-vivah');
  }

  search() {
    console.log('search function is called')
    let params = {
      is_search: true,
      user_id: this.global.currentUser.id,
      profile_id: this.profile_id,
      looking_for: this.searchform.value.looking_for,
      age_min: this.searchform.value.age.lower,   
      age_max: this.searchform.value.age.upper,   
      height_min: this.searchform.value.height.lower,   
      height_max: this.searchform.value.height.upper,   
      income_min: this.searchform.value.income.lower,   
      income_max: this.searchform.value.income.upper,   
      marital_status_ids: this.searchform.value.marital_status_ids,   
      eduction_ids: this.searchform.value.eduction_ids,   
      job_ids: this.searchform.value.job_ids   
    }
    console.log('params:', params);

    this.storage.set('search_filters', params);

    this.navCtrl.navigateForward('lagn-vivah');
  }

}
