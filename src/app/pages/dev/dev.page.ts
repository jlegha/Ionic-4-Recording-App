import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.page.html',
  styleUrls: ['./dev.page.scss'],
})
export class DevPage implements OnInit {

  constructor(
    private router: Router, 
    ) { }

  ngOnInit() {
    setTimeout(() => {
      this.router.navigateByUrl('/home')
    } , 3000);
    
  }

  ionViewWillEnter() {
  }
}
