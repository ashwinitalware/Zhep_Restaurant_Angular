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

  table_accepted = {
    order_id: '',
  };

  table_cancelled ={
    order_id: '',
  }

 
  book_order() {
  }

  processing_order() {
  }

  completed_order() {
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
              this.url.presentToast('You have no Order.');
            }
          },
          (err) => {
          }
        );
    });
  }

  moveOrderToProcessing(order_id: any) {
    const index = this.allbooktables.findIndex((order: any) => order.order_id2 === order_id);
    if (index !== -1) {
      const acceptedOrder = this.allbooktables.splice(index, 1)[0]; // Remove order from 'New Order'
      this.allprocessing.push(acceptedOrder); // Add order to 'Processing'
      this.switchTab = 'processing'; // Switch segment to 'Processing'
    }
  }

  accept_table(order_id2: any) {
    this.storage.get('restro').then((res1) => {
      this.user_id1 = parseInt(res1.email, 10);
      this.table_accepted['order_id'] = order_id2;
      this.url.presentLoading();
      this.http
        .post(`${this.url.serverUrl}accept_order`, this.table_accepted)
        .subscribe(
          (res: any) => {
            console.log(res);
            {
              this.url.presentToast('Your Order Table has been Accepted successfully!');
              this.get_restro_order();
            }
            this.moveOrderToProcessing(order_id2);
            this.switchTab = 'processing'; // Set segment to 'processing' after moving order
            this.url.dismiss();
          },
          (err) => {
            this.url.dismiss();
          }
        );
    });
  }

  cancel_table(order_id2: any) {
    this.storage.get('restro').then((res1) => {
      this.user_id1 = parseInt(res1.email, 10);
      this.table_cancelled['order_id'] = order_id2;
      this.url.presentLoading();
      this.http
        .post(`${this.url.serverUrl}cancel_order`, this.table_cancelled)
        .subscribe(
          (res: any) => {
            this.url.presentToast('Your Order has been cancelled successfully !');
            this.removeOrderFromList(order_id2); // Remove the order from the list
            this.url.dismiss();
          },
          (err) => {
            this.url.dismiss();
          }
        );
    });
  }
  
  removeOrderFromList(order_id: any) {
    const index = this.allbooktables.findIndex((order: any) => order.order_id2 === order_id);
    if (index !== -1) {
      this.allbooktables.splice(index, 1); // Remove the order from the array
    }
  }

}
