import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  switchTab = 'order';
  user_id1: any;
  allbooktables: any;
  session_data1: any;
  // allprocessing: any;
  allprocessing: any[] = [];
  constructor(
    public url: DataService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.storage.create();
  }

  segmentChanged(ev: any) {
    this.switchTab = ev.detail.value;
    console.log('Segment changed', ev);
  }
  ionViewWillEnter() {
    this.url.presentLoading();
    this.get_restro_order();
    setInterval((): void => {
      this.get_restro_order();
    }, 60000);
    this.url.dismiss();
  }

  book_order(){}
  processing_order(){}
  completed_order(){}

  get_restro_order() {
    this.storage.get('restro').then((res1) => {
      this.user_id1 = parseInt(res1.email, 10);
      this.http
        .get(`${this.url.serverUrl}getRestroOrder?restro_id=${this.user_id1}`)
        .subscribe(
          (res: any) => {
            if (res.status) {
              this.allbooktables = res.data;
              this.session_data1 = this.allbooktables.order_id2;
              if (this.allprocessing && this.allprocessing.length > 0) {
                this.switchTab = 'processing';
              }
            } else {
              this.url.presentToast('You have no booking.');
            }
          },
          (err) => {
          }
        );
    });
  }

}
