import {Component, OnInit} from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  ngOnInit() {
    var config = {
      apiKey: "AIzaSyD95PljL3lU3Lr7TcfNUywEJlQtQw5q0Kc",
      authDomain: "tia-projekt-6f09f.firebaseapp.com",
      databaseURL: "https://tia-projekt-6f09f.firebaseio.com",
      projectId: "tia-projekt-6f09f",
      storageBucket: "tia-projekt-6f09f.appspot.com",
      messagingSenderId: "855532051166",
      appId: "1:855532051166:web:547cf5960e912a3bea004f",
      measurementId: "G-ZBWNV4PYMB"
    };
    firebase.initializeApp(config);
  }
}
