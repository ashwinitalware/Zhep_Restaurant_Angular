import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
declare const google: any;

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.page.html',
  styleUrls: ['./show-map.page.scss'],
})
export class ShowMapPage implements OnInit {


  map: any;
  @ViewChild('mapElement') mapElement: any;
  shop_location: any;

  // Add the following variable at the top of your class
  isSatelliteView: boolean = false;

  getCurrentPosition: any;
  user_address = 'Move home marker to select your address';
  btn_disabled: any;
  user_lat = 20.938894;
  user_lang = 77.7421033;
  user_marker: any;

  dropOffAddress: string = '';
  directionsService: any;
  directionsRenderer: any;
  distanceInKm: any;

  lat: any;
  long: any;
  session_data2 = {
    lat: '',
    lng: '',
  };
  position_id1: any;

  constructor(
    private url: DataService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage,
    private navCtrl: NavController
  ) {}

  ionViewDidEnter() {
    this.lat = this.url.lat;
    this.long = this.url.long;
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: this.user_lat, lng: this.user_lang },
      zoom: 14,
      disableDefaultUI: true, // a way to quickly hide all controls
    });
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
    this.printCurrentPosition();
    this.dropMarker();
  }

  // Add the following function in your class
  toggleSatelliteView() {
    this.isSatelliteView = !this.isSatelliteView;
    this.map.setMapTypeId(this.isSatelliteView ? 'hybrid' : 'roadmap');
  }

  dropMarker() {
    google.maps.event.addListener(this.map, 'click', (event: any) => {
      if (this.user_marker) {
        this.user_marker.setMap(null); // Remove existing marker
      }
      this.user_marker = new google.maps.Marker({
        position: event.latLng,
        map: this.map,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      this.user_lat = event.latLng.lat();
      this.user_lang = event.latLng.lng();
      this.fetchAddress(event.latLng.lat(), event.latLng.lng());
      this.user_marker.addListener('dragend', (e: any) => {
        this.user_lat = e.latLng.lat();
        this.user_lang = e.latLng.lng();
        this.fetchAddress(e.latLng.lat(), e.latLng.lng());
      });
    });
  }

  fetchAddress(lat: number, lng: number) {
    const reverseGeocodingUrl =
      'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
      lat +
      ',' +
      lng +
      '&sensor=true&key=AIzaSyAuoy_mOPfYGqoZDE2JUT0aceQFEe73yZE';

    fetch(reverseGeocodingUrl)
      .then((result) => result.json())
      .then((featureCollection) => {
        this.user_address = featureCollection.results[0].formatted_address;
        this.btn_disabled = false;
      });
  }

  printCurrentPosition = async () => {
    const resp = await Geolocation.getCurrentPosition({
      maximumAge: 5000,
      timeout: 5000,
      enableHighAccuracy: true,
    });
    // alert(resp.coords.latitude);
    // this.user_lat = resp.coords.latitude;
    // this.user_lang = resp.coords.longitude;
    // this.get_user_current_position(this.user_lat, this.user_lang);
    this.get_user_current_position(resp.coords.latitude, resp.coords.longitude);
    console.log(
      'Current position:',
      resp.coords.latitude,
      resp.coords.longitude
    );
  };
  confirm_address() {
    // this.calculate_distance_from_shop();
    this.navCtrl.back();
  }

  get_user_current_position(lat: number, lng: number) {
    this.user_marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    this.map.setZoom(18);
    const latLng2 = new google.maps.LatLng(lat, lng);
    this.map.panTo(latLng2);
    this.fetchAddress(lat, lng);
    this.user_marker.addListener('dragend', (e: any) => {
      this.user_lat = e.latLng.lat();
      this.user_lang = e.latLng.lng();
      this.fetchAddress(e.latLng.lat(), e.latLng.lng());
    });

    // this.session_data2['lat'] = '';
    // // eslint-disable-next-line @typescript-eslint/dot-notation
    // this.session_data2['lng'] = '';
    // this.storage.set('position', this.session_data2);
    // console.log(this.storage.get('position'));

    // // eslint-disable-next-line @typescript-eslint/no-shadow
    // this.storage.get('position').then((res) => {
    //   this.position_id1 = parseInt(res.lat, 10);
    //   console.log(this.position_id1);
    // });

  }
  showRoute() {
    if (this.user_lat && this.user_lang && this.dropOffAddress) {
      const request = {
        origin: new google.maps.LatLng(this.user_lat, this.user_lang),
        destination: this.dropOffAddress,
        travelMode: 'DRIVING',
      };

      this.directionsService.route(request, (result: any, status: any) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(result);

          const distance =
            google.maps.geometry.spherical.computeDistanceBetween(
              result.routes[0].legs[0].start_location,
              result.routes[0].legs[0].end_location
            );
          const distanceInKm = (distance / 1000).toFixed(2);
          this.distanceInKm = distanceInKm;

          const distanceMarker = new google.maps.Marker({
            position: result.routes[0].legs[0].end_location,
            map: this.map,
            label: distanceInKm + ' km',
          });

          const bounds = new google.maps.LatLngBounds();
          bounds.extend(new google.maps.LatLng(this.user_lat, this.user_lang));
          bounds.extend(result.routes[0].legs[0].end_location);
          this.map.fitBounds(bounds);
        }
      });
    }
  }



  confirmAddress() {
    console.log('User Address:', this.user_address);
    console.log('Drop-off Address:', this.dropOffAddress);
    console.log('User Location:', this.user_lat, this.user_lang);

    this.dropOffAddress = ''; // Clear the input field
    this.directionsRenderer.set('directions', null); // Reset the directions
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}
 

}
