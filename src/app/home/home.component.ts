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
  udaje : any = {};
  allPeople : any = [];
  login: any;
  email: any;
  najdenyUzivatelID: any;
  udajeOsoba : any = {};
  organizaciaBooelean : Boolean;
  isOwner: Boolean;
  upravUzivatelovBoolean: Boolean;
  najdenyUzivatel: Boolean;
  uzJeClen: Boolean;
  neexistujeOwner: Boolean;
  homeBoolean: Boolean;
  pozriUzivatela: Boolean;
  siJedinyOwner: Boolean;
  neexistuje: boolean;


  constructor(private router : Router) {
    this.userID = {};
    this.udaje = {};
    this.organizaciaBooelean = false;
    this.isOwner = false;
    this.upravUzivatelovBoolean = false;
    this.uzJeClen = false;
    this.najdenyUzivatel = false;
    this.neexistujeOwner = false;
    this.homeBoolean = true;
    this.pozriUzivatela = false;
    this.siJedinyOwner = false;
    this.neexistuje = false;
  }

  ngOnInit() {
    this.OverOdkialIdem();
    this.resolveOrg();

  }
  OverOdkialIdem(){
    if (JSON.parse(localStorage.getItem('org')) !== null){
        this.orgUdaje(JSON.parse(localStorage.getItem('org')).nazovOrganizacie);
    }
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
    this.organizaciaUdaje= JSON.parse(localStorage.getItem('org'));
  }
  orgUdaje(organizacia){
    this.organizaciaBooelean = true;
    this.homeBoolean = false;
    this.isOwner = false;
    this.pozriUzivatela = false;
    this.siJedinyOwner = false;
    let userID = JSON.parse(localStorage.getItem('user')).uid;
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
    this.Owner(userID);
    this.resolveOrganizaciaUdaje();
    this.naplnAllPeople(this.udaje.uid);


  }

  Owner(userID){
    let OrgID = JSON.parse(localStorage.getItem('org')).uid;
    firebase.database().ref('organizacie/' + OrgID + '/clenovia')
      .on("child_added", (userData) => {
        if (userData.key == userID) {
          if (userData.val() == 'owner') {
            this.isOwner = true;
          }
        }
      });
  }


  spat(){
    this.organizaciaBooelean = false;
    this.homeBoolean = true;
    this.siJedinyOwner = false;
    let userID = JSON.parse(localStorage.getItem('user')).uid;
    firebase.database().ref('users/' + userID)
      .once("value", (userData)=> {
        let user = userData.val();
        user.uid = userID;
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(user));
      });
    localStorage.removeItem('org');
    this.resolveOrg();
  }

  naplnAllPeople(organizacia){
    let tmp = [];
    firebase.database().ref('organizacie/' + organizacia + '/clenovia')
      .on("child_added", (userData)=>{
        firebase.database().ref('users/')
          .on("child_added", (Data)=>{
            if(userData.key==Data.key){
              let udaje = {
                "name": Data.val().name,
                "pozicia": userData.val(),
                "meno": Data.val().meno,
                "priezvisko": Data.val().priezvisko,
                "adresa": Data.val().adresa,
                "tel": Data.val().telefon,
                "uid": Data.key,
                "mail": Data.val().mail
              };
              tmp.push(udaje);
            }
          });
      });
    this.allPeople = tmp;
  }

  uprav(){
    this.upravUzivatelovBoolean = true;
    this.organizaciaBooelean = false;
    this.siJedinyOwner = false;
    let OrgID = JSON.parse(localStorage.getItem('org')).uid;
    this.naplnClenovOrganizacie(OrgID);
  }

  vymaz(organizaciaUID) {
    const userID = JSON.parse(localStorage.getItem('user')).uid;
    firebase.database().ref('users/' + userID + '/organizacie/' +  organizaciaUID)
      .remove();
    firebase.database().ref('organizacie/' +  organizaciaUID + '/clenovia/' + userID)
      .remove();
  }

  opusti() {
    this.siJedinyOwner = false;
    let OrgID = JSON.parse(localStorage.getItem('org')).uid;
    let userFunkcia = (JSON.parse(localStorage.getItem('user')).organizacie[OrgID].funkcia);
    if (userFunkcia !== 'owner'){
      let userID = JSON.parse(localStorage.getItem('user')).uid;
      this.vymaz(OrgID);
      firebase.database().ref('users/' + userID)
        .once("value", (userData)=> {
          let user = userData.val();
          user.uid = userID;
          localStorage.removeItem('user');
          console.log(user);
          localStorage.setItem('user', JSON.stringify(user));
        });
      localStorage.removeItem('org');
      this.homeBoolean = true;
      this.organizaciaBooelean = false;
      this.resolveOrg();
    } else {
      let funkcieOrg = [];
      firebase.database().ref('organizacie/' + OrgID + '/clenovia')
        .on('child_added', (idOrgData) => {
          if(idOrgData.val() == 'owner') {
            funkcieOrg.push(idOrgData.val());
          }
        });
      console.log(funkcieOrg.length);
      if (funkcieOrg.length > 1) {
        let userID = JSON.parse(localStorage.getItem('user')).uid;
        this.vymaz(OrgID);
        firebase.database().ref('users/' + userID)
          .once("value", (userData)=> {
            let user = userData.val();
            user.uid = userID;
            localStorage.removeItem('user');
            console.log(user);
            localStorage.setItem('user', JSON.stringify(user));
          });
        localStorage.removeItem('org');
        this.homeBoolean = true;
        this.organizaciaBooelean = false;
        this.resolveOrg();
      } else {
        this.siJedinyOwner = true;
        console.log('bohuzial si jediny owner');
      }
    }
  }

  naplnClenovOrganizacie(organizacia) {
    let tmp = [];
    firebase.database().ref('organizacie/' + organizacia + '/clenovia')
      .on("child_added", (userData) => {
        firebase.database().ref('users/')
          .on("child_added", (Data) => {
            if (userData.key == Data.key) {
              let udaje = {
                "name": Data.val().name,
                "mail": Data.val().mail,
                "pozicia": userData.val(),
                "meno": Data.val().meno,
                "priezvisko": Data.val().priezvisko,
                "adresa": Data.val().adresa,
                "tel": Data.val().telefon,
                "uid": Data.key
              };
              tmp.push(udaje);
            }
          });
      });

    this.allPeople = tmp;
  }

  odstran(person) {
    let orgID = JSON.parse(localStorage.getItem('org')).uid;
    firebase.database().ref('users/' + person.uid + '/organizacie/' + orgID)
      .remove();
    firebase.database().ref('organizacie/' + orgID + '/clenovia/' + person.uid)
      .remove();
    this.naplnClenovOrganizacie(orgID);
  }

  vyhladaj(str) {
    let pole = [];
    this.uzJeClen = false;
    this.najdenyUzivatel = false;
    this.neexistujeOwner = false;
    this.neexistuje = false;
    const orgID =  JSON.parse(localStorage.getItem('org')).uid;
    firebase.database().ref('organizacie/' + orgID + '/clenovia')
      .on('child_added', (clenoviaOrg) => {
        pole.push(clenoviaOrg.key);
      });
    if (str.includes('@')) {
      firebase.database().ref('users')
        .on('child_added', (uzivateliaApp) => {
          if (str === uzivateliaApp.val().mail) {
            this.neexistuje = false;
            if (pole.includes(uzivateliaApp.key)) {
              this.uzJeClen = true;
            } else {
              this.najdenyUzivatel = true;
              this.login = uzivateliaApp.val().name;
              this.email = str;
              this.najdenyUzivatelID = uzivateliaApp.key;
            }
          } else {
            this.neexistuje = true;
          }
        });
    } else {
      firebase.database().ref('users')
        .on('child_added', (uzivateliaApp) => {
          if (str === uzivateliaApp.val().name) {
            this.neexistuje = false;
            if (pole.includes(uzivateliaApp.key)) {
              this.uzJeClen = true;
            } else {
              this.najdenyUzivatel = true;
              this.login = str;
              this.email = uzivateliaApp.val().mail;
              this.najdenyUzivatelID = uzivateliaApp.key;
            }
          } else {
            this.neexistuje = true;
          }
        });
    }
  }
  pridajUzivatela(person, str){
    let orgID = JSON.parse(localStorage.getItem('org')).uid
    this.neexistujeOwner = false;
    const udaje = {
      'funkcia': str,
      'nazovOrganizacie': JSON.parse(localStorage.getItem('org')).nazovOrganizacie,
      //'nazovOrganizacie' : this.idOrgName,
    };
    firebase.database().ref('users/' + person + '/organizacie')
      .update({
        [orgID] : udaje
      });
    firebase.database().ref('organizacie/' + orgID + '/clenovia')
      .update({
        [person] : str
      });
    this.naplnClenovOrganizacie(orgID);
  }

  potvrd() {
    this.isOwner = false;
    let funkcieOrg = [];
    let IDsOrg = [];
    let orgID = JSON.parse(localStorage.getItem('org')).uid;
    firebase.database().ref('organizacie/' + orgID + '/clenovia')
      .on('child_added', (idOrgData) => {
        IDsOrg.push(idOrgData.key);
        funkcieOrg.push(idOrgData.val());
      });
    let userID = JSON.parse(localStorage.getItem('user')).uid;
    firebase.database().ref('users/' + userID)
      .once("value", (userData)=> {
        let user = userData.val();
        user.uid = userID;
        localStorage.removeItem('user');
        //console.log(user);
        localStorage.setItem('user', JSON.stringify(user));
      });
    if(funkcieOrg.includes('owner')) {
      this.upravUzivatelovBoolean = false;
      this.Owner(userID);
      if(IDsOrg.includes(userID)){
        this.organizaciaBooelean = true;
      } else {
        this.homeBoolean = true;
        this.resolveOrg();
      }
    } else {
      this.neexistujeOwner = true;
    }
  }

  profil(person) {
    this.pozriUzivatela = true;
    this.organizaciaBooelean = false;
    this.siJedinyOwner = false;
    this.udajeOsoba = person;
  }
  vratSa() {
    this.pozriUzivatela = false;
    this.organizaciaBooelean = true;
  }

  nie() {
    this.siJedinyOwner = false;
  }

  vymazOrg(organizaciaUID) {
    firebase.database().ref('users')
      .on("child_added", (usersData) => {
        console.log(usersData.val());
        console.log(usersData.key);
        firebase.database().ref('users/' + usersData.key + "/organizacie")
          .on("child_added", (jehoUserData)=> {
            if(jehoUserData.key === organizaciaUID) {
              firebase.database().ref('users/' + usersData.key + '/organizacie/' + jehoUserData.key)
                .remove();
            }
          });
      });
    firebase.database().ref('organizacie/' +  organizaciaUID )
      .remove();
   /*
    firebase.database().ref('organizacie/' +  organizaciaUID + '/clenovia/' + userID)
      .remove();*/
  }
  ano() {
    let OrgID = JSON.parse(localStorage.getItem('org')).uid;
    let userID = JSON.parse(localStorage.getItem('user')).uid;
    this.vymazOrg(OrgID);
    console.log('akoze som vymazal Org');
     firebase.database().ref('users/' + userID)
       .once("value", (userData)=> {
         let user = userData.val();
         user.uid = userID;
         localStorage.removeItem('user');
         console.log(user);
         localStorage.setItem('user', JSON.stringify(user));
       });
     localStorage.removeItem('org');
     this.homeBoolean = true;
     this.organizaciaBooelean = false;
     this.resolveOrg();
  }

  stretnutia() {
    this.router.navigate(['stretnutie',]);
  }
}



