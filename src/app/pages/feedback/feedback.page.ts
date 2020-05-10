import { Component, ViewChild, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';
import { NgForm, Validators, FormBuilder, FormGroup, Form } from '@angular/forms';
import { Platform, NavController } from '@ionic/angular';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {

  feedbackForm: FormGroup;

  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    private storage: Storage,
    private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public apis: ApisService
  ) {

    this.feedbackForm = formBuilder.group({
      description: ['', Validators.compose([Validators.required])],
    });

  }

  ngOnInit() {

    this.translate.setDefaultLang(this.global.language);
  }

  shareFeedback() {

    this.global.showloading();

    let params = {
      user_id: this.global.currentUser.id,
      description: this.feedbackForm.value.description
    };
    this.apis.shareFeedback(params)
      .subscribe((result: any) => {

        console.log('result:', result);
        this.global.hideloading();

        this.global.showMsg(result.message);

        if (result.status) {
          this.feedbackForm.reset()
          //this.navCtrl.navigateForward('/');
        }
      },
        error => {
          console.error(error.message);
          this.global.hideloading();
          this.global.showMsg(error);
        });
  }

}
