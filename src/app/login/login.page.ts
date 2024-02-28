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
          } else {
            this.session_data['email'] = res.user.id; // Update this line to access the correct user id property
            this.storage.set('restro', this.session_data);
  
            this.url.presentToast('Login Successfully');
            this.router.navigate(['/dashboard']).then(() => {
              this.dismissLoader(); // Dismiss the loader after navigation
            });
          }
        },
        (err) => {
          this.dismissLoader();
          // Handle the error case
          // this.loader_visibility = false;
          // this.func.presentToast("Server Error. Please try after some time.");
        }
      );
    }
  }
  
  dismissLoader() {
    // Dismiss the loader here
    this.url.dismiss();
  }
  

}
