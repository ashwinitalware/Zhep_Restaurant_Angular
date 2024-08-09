/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { DataService } from '../data.service';
import { Storage } from '@ionic/storage-angular';
declare const google: any;

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.page.html',
  styleUrls: ['./show-map.page.scss'],
})
export class ShowMapPage implements OnInit {
  map: any;
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;

  user_address = 'Move home marker to select your address';
  user_lat = 20.938894;
  user_lng = 77.7421033;
  user_marker: any;
  destinationLat: number | null = null;
  destinationLng: number | null = null;
  user_id1: number | null = null;
  firstName: any;
  lastName: any;
  primary_contact: any;
  estimatedTime: string = ''; // Variable to hold estimated time
  updateInterval: any;
  constructor(
    private router: Router,
    private http: HttpClient,
    private storage: Storage,
    private route: ActivatedRoute,
    public url: DataService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const orderId = params['id'];
      if (orderId) {
        this.get_delivery_location(orderId);
      }
    });
    this.startUpdatingLocation();
  }

  ionViewDidEnter() {
    this.loadMap();
    // this.getCurrentLocation();
  }

  ngOnDestroy() {
    this.stopUpdatingLocation();
  }

  openDialer(phoneNumber: string) {
    window.open(`tel:+91${phoneNumber}`, '_system');
  }

  get_delivery_location(id: any) {
    this.storage.get('restro').then((res1) => {
      this.user_id1 = parseInt(res1.email, 10);
      this.http
        .get(`${this.url.serverUrl}get_delivery_location?order_id=${id}`)
        .subscribe(
          (res: any) => {
            if (res.status === true) {
              console.log(res.data[0], 789)
              const deliveryLocation = res.data[0]; 
              this.firstName = deliveryLocation.first_name;
              this.lastName = deliveryLocation.last_name;
              this.primary_contact = deliveryLocation.primary_contact;
              this.destinationLat = parseFloat(deliveryLocation.latitude);
              this.destinationLng = parseFloat(deliveryLocation.longitude);
              this.showRoute(this.user_lat, this.user_lng, this.destinationLat, this.destinationLng);
            } else {
              this.url.presentToast('Failed to retrieve delivery boy address. Please try again.');
            }
          },
          (err) => {
            console.error('Error:', err);
            this.url.presentToast('Failed to retrieve delivery boy address. Please try again.');
          }
        );
    });
  }

  startUpdatingLocation() {
    this.updateInterval = setInterval(() => {
      const orderId = this.route.snapshot.params['id'];
      if (orderId) {
        this.get_delivery_location(orderId);
      }
    }, 30000); 
  }

  stopUpdatingLocation() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }


  loadMap() {
    const mapOptions = {
      center: { lat: this.user_lat, lng: this.user_lng },
      zoom: 14,
      disableDefaultUI: true,
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.printCurrentPosition();
  }

  printCurrentPosition = async () => {
    try {
      const resp = await Geolocation.getCurrentPosition({
        maximumAge: 5000,
        timeout: 5000,
        enableHighAccuracy: true,
      });
      this.user_lat = resp.coords.latitude;
      this.user_lng = resp.coords.longitude;
      this.get_user_current_position(this.user_lat, this.user_lng);
    } catch (error) {
      console.error('Error getting current position:', error);
    }
  };

  get_user_current_position(lat: number, lng: number) {
    if (this.user_marker) {
      this.user_marker.setMap(null);
    }
    this.user_marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    this.map.setZoom(18);
    const latLng2 = new google.maps.LatLng(lat, lng);
    this.map.panTo(latLng2);

    if (this.destinationLat !== null && this.destinationLng !== null) {
      this.showRoute(lat, lng, this.destinationLat, this.destinationLng);
    }
  }
  showRoute(originLat: number, originLng: number, destLat: number, destLng: number) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: '#000000', // Set the route color to black
        strokeWeight: 7, // Adjust the thickness of the route
      }
    });
    directionsRenderer.setMap(this.map); // Set the directionsRenderer's map
  
    const request = {
      origin: { lat: originLat, lng: originLng },
      destination: { lat: destLat, lng: destLng },
      travelMode: 'DRIVING',
    };
  
    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        const route = result.routes[0];
        const leg = route.legs[0];
        this.estimatedTime = leg.duration.text; // Set estimated time
      } else {
        console.error('Failed to get directions:', status);
      }
    });
  }
  

  showRoute1(originLat: number, originLng: number, destLat: number, destLng: number) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(this.map); // Set the directionsRenderer's map

    const request = {
      origin: { lat: originLat, lng: originLng },
      destination: { lat: destLat, lng: destLng },
      travelMode: 'DRIVING',
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        const route = result.routes[0];
        const leg = route.legs[0];
        this.estimatedTime = leg.duration.text; // Set estimated time
      } else {
        console.error('Failed to get directions:', status);
      }
    });
  }
}
