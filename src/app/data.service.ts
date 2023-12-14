import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
@Injectable({
  providedIn: 'root'
})
export class DataService {

  isLoading: any;
  serverUrl = 'https://zhepfood.com/public/api/';
  imageUrl = 'https://zhepfood.com/public/banner/';

  constructor(
    private storage: Storage,
    private toastCtrl: ToastController,
    public http: HttpClient,
    public loadingController: LoadingController
  ) {}

  async presentToast(str: any) {
    const toast = await this.toastCtrl.create({
      message: str,
      duration: 3000,
    });
    toast.present();
  }
  async dismiss() {
    this.isLoading = false;
    return await this.loadingController
      .dismiss()
      .then(() => console.log('dismissed'));
  }

  async presentLoading() {
    this.isLoading = true;
    return await this.loadingController
      .create({
        // duration: 5000,
      })
      .then((a) => {
        a.present().then(() => {
          console.log('presented');
          if (!this.isLoading) {
            a.dismiss().then(() => console.log('abort presenting'));
          }
        });
      });
  }
}
