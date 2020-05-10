import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/providers/apis/apis';
import { NavController, ModalController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalProvider } from 'src/providers/globals/globals';
import { ReportEventComponent } from './report-event/report-event.component';


@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.page.html',
  styleUrls: ['./event-detail.page.scss'],
})
export class EventDetailPage implements OnInit {
  eventId: any = 0;
  eventDetailData: any = [];
  date: string;
  time: string;
  images: any = [];
  editable: boolean = false;

  constructor(
    private apis: ApisService,
    public navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public global: GlobalProvider,
    private modalCtrl: ModalController,
    private loadingController: LoadingController
    ) { 
      this.eventId = this.activatedRoute.snapshot.paramMap.get('profile_id');
      console.log(this.eventId);

    }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getEventData();
  }

  reportEvent(id) {
    this.modalCtrl
    .create({ component: ReportEventComponent, 
      componentProps: { actionId: this.eventDetailData.id} })
    .then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    });
  }

  getEventData() {
    this.apis.eventDetail(this.eventId).subscribe((eventData: any) => {
      console.log(eventData);
      this.eventDetailData = eventData.data;
      console.log(this.eventDetailData);
      console.log(this.eventDetailData.user_id);
      console.log(this.global.currentUser.id);
      if (this.eventDetailData.user_id == this.global.currentUser.id) {
        this.editable = true;
        console.log('true;;;;;;');
      }
      this.images = this.eventDetailData.images;
      console.log(this.images);
      this.date = this.eventDetailData.start_date_time.slice(0,10);
      this.time = this.eventDetailData.start_date_time.slice(11,16);
      console.log(this.eventDetailData.start_date_time.slice(0,10));
    });
  }

  editEvent(id) {
    console.log(id);
    this.navCtrl.navigateForward('events/edit-event/' + id);
  }

  async deleteEvent(id) {
    console.log(this.global.currentUser.id); 

    const loading = await this.loadingController.create({
      message: 'Adding Data...',
    });

    let params = {
      user_id :this.global.currentUser.id,
      id: id
    }
    this.apis.deleteEvent(params).subscribe((resData: any) => {
      console.log(resData);
      loading.dismiss();
      if (resData.status) {
        this.global.showMsg(resData.message);
      } else {
        this.global.showError(resData.message);
      }
    });
  }

}
