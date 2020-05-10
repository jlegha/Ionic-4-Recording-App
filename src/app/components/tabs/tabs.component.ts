import { Component, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {

  constructor(
    private navCtrl: NavController,
  ) { }

  ngOnInit() {}

  gotoHome() {
    this.navCtrl.navigateRoot('home');
  }

  gotoSortlist() {
    this.navCtrl.navigateRoot('sortlist');
  }

  gotoInterest() {
    this.navCtrl.navigateRoot('interest');
  }

  gotoMessages() {
    this.navCtrl.navigateRoot('chat-list');
  }

  gotoSearch() {
    this.navCtrl.navigateRoot('search-filters');
  }

}
