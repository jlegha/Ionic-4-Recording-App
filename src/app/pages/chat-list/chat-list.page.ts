import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';
import { Platform, NavController } from '@ionic/angular';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  styleUrls: ['./chat-list.page.scss'],
})
export class ChatListPage implements OnInit {

  users: any = [];
  
  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    private storage: Storage,
    public navCtrl: NavController,
    public apis: ApisService
  ) {
    
  }

  ngOnInit() {

  }
  
  ionViewDidEnter() {
    
    this.getChatUsers();
  }

  getChatUsers() {
    this.global.showloading();

    let params = {user_id: this.global.currentUser.id}
    this.apis.getChatUsers(params).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        
        if (result.status) {
          this.users = result.data;
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

  message(user) {
    let receiver_id = (user.receiver_id == this.global.currentUser.id) ? user.sender_id : user.receiver_id;
    let profile_id = user.profile_id;
    this.navCtrl.navigateForward('/chat/'+receiver_id+'/'+profile_id);
  }

}
