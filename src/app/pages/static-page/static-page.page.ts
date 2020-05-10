import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';

import { NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Platform, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-static-page',
  templateUrl: './static-page.page.html',
  styleUrls: ['./static-page.page.scss'],
})
export class StaticPagePage implements OnInit {

  pageDetail: any = {};
  slug: string = '';

  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    public navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    public apis: ApisService
  ) {

    this.slug = this.activatedRoute.snapshot.paramMap.get('slug');;
    this.getStaticPage();
  }

  ngOnInit() {

  }

  ionViewWillEnter() {

  }

  getStaticPage() {
    this.global.showloading();

    this.apis.staticPage({ slug: this.slug })
      .subscribe((result: any) => {

        console.log('result:', result);

        this.global.hideloading();
        this.pageDetail = result.data;
      },
        error => {
          console.error(error.message);
          this.global.hideloading();
          this.global.showMsg(error);
        });
  }

}

