import { Component, OnInit } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import { ApisService } from 'src/providers/apis/apis';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
  today: any = [];
  past: any = [];
  upcoming: any = [];
  status: string;
  images: any = [];

  constructor(
    private apis: ApisService,
    public navCtrl: NavController
  ) { }

  ngOnInit() {
    this.status = 'today';
  }

  ionViewWillEnter() {
    this.getTodayData();
    this.getPastData();
    this.getUpcomingData();
  }

  getTodayData() {
    this.apis.getEventData('today').subscribe((eventData: any) => {
      this.today = eventData.data;
      // console.log(this.today[0]);

      for(let i = 0; i < this.today.length; i++) {		
		    for(let j = i + 1; j < this.today.length; j++) {
          let date1 = this.today[i].start_date_time.replace(/-/g,'');
          let date2 = this.today[j].start_date_time.replace(/-/g,'');
          let compareDate1 = date1.slice(0,8);
          let compareDate2 = date2.slice(0,8);
          console.log(compareDate1 + ':' + compareDate2);
			    if(this.today[i].start_date_time.slice(0,10) > this.today[j].start_date_time.slice(0,10)) {
            let temp  = this.today[i];
            this.today[i] = this.today[j];
            this.today[j] = temp;
			    }
	      }
      }
      if (this.today[0]) {
        console.log('true');
      } else {
        console.log('false');
      }
    });
  }

  getPastData() {
    this.apis.getEventData('past').subscribe((eventData: any) => {
      this.past = eventData.data;
      console.log(eventData);
      console.log(this.past);
      // console.log(this.past[0].title);
      
      for(let i = 0; i < this.past.length; i++) {		
		    for(let j = i + 1; j < this.past.length; j++) {
          let date1 = this.past[i].start_date_time.replace(/-/g,'');
          let date2 = this.past[j].start_date_time.replace(/-/g,'');
          let compareDate1 = date1.slice(0,8);
          let compareDate2 = date2.slice(0,8);
          console.log(compareDate1 + ':' + compareDate2);
			    if(this.past[i].start_date_time.slice(0,10) > this.past[j].start_date_time.slice(0,10)) {
            let temp  = this.past[i];
            this.past[i] = this.past[j];
            this.past[j] = temp;
			    }
	      }
      }

      for(let i = 0; i < this.past.length; i++) {
        console.log(this.past[i]);
        this.images[i] = this.past[i].image;
      }
      console.log(this.images);
      console.log(this.past[0].start_date_time.replace(/-/g,''));

      if(this.past[0]) {
        console.log('true');
      } else {
        console.log('false');
      }
    });
  }

  getUpcomingData() {
    this.apis.getEventData('upcoming').subscribe((eventData: any) => {
      this.upcoming = eventData.data;
      console.log(this.upcoming);

      for(let i = 0; i < this.upcoming.length; i++) {		
		    for(let j = i + 1; j < this.upcoming.length; j++) {
          let date1 = this.upcoming[i].start_date_time.replace(/-/g,'');
          let date2 = this.upcoming[j].start_date_time.replace(/-/g,'');
          let compareDate1 = date1.slice(0,8);
          let compareDate2 = date2.slice(0,8);
          console.log(compareDate1 + ':' + compareDate2);
			    if(this.upcoming[i].start_date_time.slice(0,10) > this.upcoming[j].start_date_time.slice(0,10)) {
            let temp  = this.upcoming[i];
            this.upcoming[i] = this.upcoming[j];
            this.upcoming[j] = temp;
			    }
	      }
      }
    });
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    if(event.detail.value === "past") {
      this.status = 'past';
    } else if(event.detail.value === "today") {
      this.status = 'today';
    } else if(event.detail.value === "upcoming") {
      this.status = 'upcoming';
    }
    console.log(event.detail);
    console.log(this.status);
  }

  gotoEventDetail(id) {
    this.navCtrl.navigateForward('events/event-detail/' + id);
  }

}
