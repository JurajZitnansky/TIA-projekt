import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userID : any = {};
  org : any = {};
  organizaciaUdaje : any = {};
  organizaciaBooelean : Boolean;
  udaje : any = {};
  allPeople : any = [];

  constructor(private router : Router) {
    this.userID = {};
    this.udaje = {};
    this.organizaciaBooelean = false;
  }

  ngOnInit() {
    this.resolveOrg();
  }


  resolveOrg(){
    const tmp = [];
    this.userID = JSON.parse(localStorage.getItem('user')).uid;
    firebase.database().ref('organizacie')
      .on('child_added', (orgData)=>{
        if(orgData.val().clenovia[this.userID]){
          tmp.push(orgData.val().nazovOrganizacie);
        }
      });
    this.org = tmp;
  }

  resolveOrganizaciaUdaje(){
    this.organizaciaUdaje=JSON.parse(localStorage.getItem('org'));
  }
  orgUdaje(organizacia){
    this.organizaciaBooelean = true;
    firebase.database().ref('organizacie')
      .on('child_added', (orgData)=>{
        if(orgData.val().nazovOrganizacie == organizacia) {
          firebase.database().ref('organizacie/' + orgData.key)
            .on('value', (dataOrg)=>{
              this.udaje = dataOrg.val();
              this.udaje.uid = orgData.key;
              localStorage.setItem('org', JSON.stringify(this.udaje));
            });
        }
      });
    this.resolveOrganizaciaUdaje();
    this.naplnAllPeople(this.udaje.uid);
  }


  spat(){
    this.organizaciaBooelean = false;
    localStorage.removeItem('org');
    this.router.navigate(['home',]);
  }

  naplnAllPeople(organizacia){
    let tmp = [];
    firebase.database().ref('organizacie/' + organizacia + '/clenovia')
      .on("child_added", (userData)=>{
        //console.log(userData.key);
        firebase.database().ref('users/')
          .on("child_added", (Data)=>{
            //console.log(Data.key);
            if(userData.key==Data.key){
              //console.log(Data.val());
              let udaje = {
                "name": Data.val().name,
                "pozicia": userData.val(),
                "mail": Data.val().mail
              };
              tmp.push(udaje);
            }
          });
      });
    this.allPeople = tmp;
  }
}

