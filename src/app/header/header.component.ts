import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userLoggedIn : boolean;

  constructor(private router : Router) {
    this.userLoggedIn = false;
  }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(data =>{
      if(data){
        this.userLoggedIn = true;
      }
      else{
        this.userLoggedIn = false;
      }
    })

  }

  logout(){
    localStorage.removeItem('user');
    firebase.auth().signOut();
    localStorage.removeItem('org');

    this.router.navigate(['',]);
  }
}
