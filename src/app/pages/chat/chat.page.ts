import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';
import { Platform, NavController, Events, IonContent } from '@ionic/angular';
import * as firebase from 'firebase';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonContent, { static: false }) private content: any;
  @ViewChild('chat_input', { static: false }) messageInput: ElementRef;
  currentUser: any = {}
  sender_id: string = '';
  receiver_id: string = '';
  profile_id: string = '';
  childKey: string = '';
  db = firebase.database().ref('chats');
  chats: any = [];
  message: string = '';
  showEmojiPicker = false;
  title: string = 'Chat';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private angularFireDB: AngularFireDatabase,
    public translate: TranslateService,
    public global: GlobalProvider,
    private storage: Storage,
    public navCtrl: NavController,
    public apis: ApisService,
    private events: Events,
  ) {

    this.currentUser = this.global.currentUser;

    this.sender_id = this.currentUser.id;
    this.route.paramMap.subscribe(paramMap => {
      this.receiver_id = paramMap.get('receiver_id');
      this.profile_id = paramMap.get('profile_id');

      this.childKey = this.getChildKey(this.sender_id, this.receiver_id, this.profile_id);

      this.db.child(this.childKey).limitToLast(200).on('value', snap => {
        this.chats = [];
        let singleChat = {};
        snap.forEach(child => {
          singleChat = child.val();
          singleChat['created_at'] = this.timesAgo(singleChat['created_at']);
          this.chats.push(singleChat);
        });
        console.log('chats:', this.chats);
        this.scrollToBottom();
      });
    });
  }

  ngOnInit() {
    setInterval(() => {
      console.log('t');
    }, 1000)
  }

  ionViewWillEnter() {

    console.log("in ionViewWillEnter")

    this.scrollToBottom();
    this.resetBadge();
  }

  ionViewWillLeave() {
    this.resetBadge();
  }

  timesAgo(date) {

    var seconds = Math.floor((Date.now() / 1000) - date);
    var interval = Math.floor(seconds / 31536000);
    let endwith = ' ago'
    
    if (interval > 1) {
      return interval + " years" + endwith;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months" + endwith;
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days" + endwith;
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hrs" + endwith;
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " min" + endwith;
    }
    return "Just now";
  }

  onFocus() {
    // this.showEmojiPicker = false;
    // // this.content.resize();
    this.scrollToBottom();
  }

  switchEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.focus();
    } else {
      this.setTextareaScroll();
    }
    // this.content.resize();
    this.scrollToBottom();
  }

  sendMsg() {

    if (this.message.trim() == '') {
      console.log('Message is empty')
      return false;
    }

    let msgID = this.db.push().key;

    let chatMsg = {
      sender_id: this.sender_id,
      receiver_id: this.receiver_id,
      profile_id: this.profile_id,
      message: this.message.trim(),
      is_read: false,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    }

    this.updateProfileChatUsers(chatMsg); // update profile-chat-users table

    console.log('chatMsg:', chatMsg)

    this.db.child(this.childKey).child(msgID).set(chatMsg);

    this.message = ''; // reset message variable

    this.scrollToBottom();
  }

  updateProfileChatUsers(msgObj) {

    let params = {
      sender_id: msgObj.sender_id,
      receiver_id: msgObj.receiver_id,
      profile_id: msgObj.profile_id,
      last_message: msgObj.message,
    };
    this.apis.updateProfileChatUsers(params).subscribe(
      (result: any) => {
        console.log(result);
      },
      (err: any) => {
        console.log(err);
      });
  }

  getChildKey(sender_id, receiver_id, profile_id) {

    let keyCombination = '';

    if (sender_id < receiver_id) {
      keyCombination = sender_id + '-' + receiver_id + '-' + profile_id;
    } else {
      keyCombination = receiver_id + '-' + sender_id + '-' + profile_id;
    }

    return keyCombination;
  }

  resetBadge() {

    let params = {
      user_id: this.global.currentUser.id,
      profile_id: this.profile_id,
    }
    this.apis.resetBadge(params).subscribe(
      (result: any) => {
        console.log(result);
      },
      (err: any) => {
        console.log(err);
      });
  }

  getMsgIndexById(id: string) {
    return this.chats.findIndex(e => e.messageId === id)
  }

  scrollToBottom() {
    setTimeout(() => {
      if (typeof this.content.scrollToBottom !== 'undefined') {
        this.content.scrollToBottom(300);
      }
    }, 100)
  }

  private focus() {
    if (this.messageInput && this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
    }
  }

  private setTextareaScroll() {
    const textarea = this.messageInput.nativeElement;
    textarea.scrollTop = textarea.scrollHeight;
  }

}
