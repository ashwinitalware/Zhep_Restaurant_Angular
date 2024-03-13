import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Geolocation } from '@capacitor/geolocation';
import { NgForm } from '@angular/forms';
declare const google: any;

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.page.html',
  styleUrls: ['./show-map.page.scss'],
})
export class ShowMapPage implements OnInit {


  map: any;
  @ViewChild('mapElement') mapElement: any;
  page: HTMLElement | null = document.querySelector('app-show-map');

  modalRef: HTMLIonModalElement | undefined;

  shop_location: any;
  getCurrentPosition: any;
  user_address = 'Move home marker to select your address';
  btn_disabled: any;
  user_lat = 20.938894;
  user_lang = 77.7421033;
  user_marker: any;
  geolocation: any;
  user_id1: any;

  delivery_data = {
    user_id: '',
    full_name: '',
    contact_number: '',
    house_number: '',
    address_type: '',
    landmark: '',
    address: '',
  };

  constructor(
    public url: DataService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage,
    private navCtrl: NavController
  ) {
    this.geolocation = Geolocation;
  }

  get_user_current_position(lat: any, lang: any) {
    this.user_marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lang),
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      icon: {
        url: `assets/icon/homemark.png`,
        scaledSize: new google.maps.Size(60, 60),
        origin: new google.maps.Point(0, 0),
      },
    });

    this.map.setZoom(18);
    const latLng2 = new google.maps.LatLng(lat, lang);
    this.map.panTo(latLng2);
    this.fetch_address(lat, lang);
    this.user_marker.addListener('dragend', (e: any) => {
      this.user_lat = e.latLng.lat();
      this.user_lang = e.latLng.lng();
      this.url.user_map_lat = e.latLng.lat();
      this.url.user_map_lan = e.latLng.lng();
      this.fetch_address(e.latLng.lat(), e.latLng.lng());
    });
  }

  fetch_address(lat: any, lng: any) {
    const reverseGeocodingUrl =
      'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
      lat +
      ',' +
      lng +
      '&sensor=true&key=AIzaSyC1Cz13aBYAbBYJL0oABZ8KZnd7imiWwA4'; 
      // AIzaSyC1Cz13aBYAbBYJL0oABZ8KZnd7imiWwA4
    fetch(reverseGeocodingUrl)
      .then((result) => result.json())
      .then((featureCollection) => {
        if (featureCollection.results && featureCollection.results.length > 0) {
          this.user_address = featureCollection.results[0].formatted_address;
          this.url.user_map_address = featureCollection.results[0].formatted_address;
          console.log(lat);
          this.url.user_map_lat = lat;
          this.url.user_map_lan = lng;
          this.btn_disabled = false;
        } else {
          console.error('No results found for the given coordinates.');
          // Handle the case where no results are found
        }
      })
      .catch((error) => {
        console.error('Error fetching address:', error);
        // Handle the error, e.g., show a message to the user
      });
  }
  

  fetch_address1(lat: any, lng: any) {
    const reverseGeocodingUrl =
      'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
      lat +
      ',' +
      lng +
      '&sensor=true&key=';
      // AIzaSyC1Cz13aBYAbBYJL0oABZ8KZnd7imiWwA4
    fetch(reverseGeocodingUrl)
      .then((result) => result.json())
      .then((featureCollection) => {
        this.user_address = featureCollection.results[0].formatted_address;
        this.url.user_map_address =
          featureCollection.results[0].formatted_address;
        console.log(lat);
        this.url.user_map_lat = lat;
        this.url.user_map_lan = lng;
        this.btn_disabled = false;
      });
  }

  ionViewDidEnter() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 20.945643, lng: 77.7639723 },
      zoom: 14,
      disableDefaultUI: true,
    });
    this.printCurrentPosition();
  }

  animatedMove(marker: any, t: any, current: any, moveto: any) {
    const lat = current.lat();
    const lng = current.lng();
    const latlng = new google.maps.LatLng(lat, lng);
    marker.setPosition(latlng);
  }

  async printCurrentPosition() {
    try {
      const resp = await this.geolocation.getCurrentPosition({
        maximumAge: 5000,
        timeout: 5000,
        enableHighAccuracy: true,
      });
      this.get_user_current_position(resp.coords.latitude, resp.coords.longitude);
      console.log('Current position:', resp.coords.latitude);
    } catch (error) {
      console.error('Error getting current position:', error);
    }
  }

  confirm_address() {
    this.router.navigate(['/cart'], { queryParams: { address: this.user_address } });
  }

  save_delivery_address(f: NgForm) {
    this.storage.get('member').then((res) => {
      this.user_id1 = parseInt(res.user_id, 10);
      this.delivery_data.user_id = this.user_id1;
      this.delivery_data.address_type = f.value.address_type;
      this.delivery_data.contact_number = f.value.contact_number;
      this.delivery_data.full_name = f.value.full_name;
      this.delivery_data.landmark = f.value.landmark;
      this.delivery_data.house_number = f.value.house_number;
      this.delivery_data.address = this.user_address;
      this.url.presentLoading();
      this.http
        .post(`${this.url.serverUrl}delivery_address`, this.delivery_data)
        .subscribe(
          (res: any) => {
            this.url.presentToast('Address added successfully.');
            this.router.navigate(['/add-delivery-address']).then(() => {
              this.url.dismiss(); 
              if (this.modalRef) {
                this.modalRef.dismiss(); // Close the modal
              }
            });
          },
          (err) => {
            this.url.presentToast('Failed to submit order. Please try again.');
            this.url.dismiss(); 
          }
        );
    });
  }

  
  // openModal() {
  //   const modal = document.querySelector('ion-modal');
  //   if (modal) {
  //     modal.componentOnReady().then(() => {
  //       modal.present();
  //     });
  //   }
  // }

  openModal() {
    const modal = document.querySelector('ion-modal');
    if (modal) {
      modal.componentOnReady().then(() => {
        this.modalRef = modal as HTMLIonModalElement;
        this.modalRef.present();
      });
    }
  }
 

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
  }

  searchAddress(event: CustomEvent) {
    const searchText = (event.detail.value || '').trim();
    if (searchText !== '') {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: searchText }, (results: any, status: any) => {
        if (status === 'OK') {
          const location = results[0].geometry.location;
          if (this.user_marker) {
            this.user_marker.setMap(null);
          }
          this.user_marker = new google.maps.Marker({
            position: location,
            map: this.map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            icon: {
              url: `assets/icon/homemark.png`,
              scaledSize: new google.maps.Size(60, 60),
              origin: new google.maps.Point(0, 0),
            },
          });
          this.map.setCenter(location);
          this.user_address = results[0].formatted_address;
          console.log('Searched Location:', this.user_address);
        } else {
          console.error('Geocode was not successful for the following reason:', status);
        }
      });
    } else {
      console.log('Search text is empty');
    }
  }


  async canDismiss(data?: any, role?: string) {
    return role !== 'gesture';
  }
  updateAddress(address: string) {
    this.user_address = address;
  }
}
