import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: any;
  user_id1: any;

  session_data = {
    email: '',
    password: '',
  };
  
  constructor(
    private router: Router,
    private http: HttpClient,
    private storage: Storage,
    public url: DataService
  ) {}

  async ngOnInit() {
    await this.storage.create();
  }



  login_submit(f: NgForm) {
    console.log(f.value);
  
    if (f.value.email !== '' && f.value.password !== '') {
      this.url.presentLoading();
  
      const requestData = {
        email: f.value.email,
        password: f.value.password
      };
  
      this.http.post(`${this.url.serverUrl}restro_login`, requestData).subscribe(
        (res: any) => {
          console.log(res);
  
          if (res.status === false) {
            this.url.presentToast('User not Registered');
            this.dismissLoader();
          } else {
            this.session_data['email'] = res.user.id; 
            this.storage.set('restro', this.session_data);
  
            this.url.presentToast('Login Successfully');
            if (res.status === false) {
              this.dismissLoader();
            } else {
              this.router.navigate(['/dashboard']).then(() => {
                this.dismissLoader();
              });
            }
            // this.router.navigate(['/dashboard']).then(() => {
            //   this.dismissLoader(); 
            // });
          }
        },
        (err) => {
          this.dismissLoader();
        }
      );
    }
  }
  
  dismissLoader() {
    // Dismiss the loader here
    this.url.dismiss();
  }
  

}
