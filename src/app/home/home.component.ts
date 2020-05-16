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
  clenoviaStretnutia : any = [];
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
  organizaciaUID: any = {};
  userUID : any = {};
  str : any = {};
  udajeStr : any = {};
  stretnutieBoolean: boolean;
  ukoncenieHlasovaniaDate : any = {};
  ukoncenieHlasovaniaTime : any = {};
  ukoncenieHlasovania: boolean;
  casStretnutia: any = {};
  stretnutieUID: any = {};
  potvrdenaUcast: boolean;
  jePoStretnutiBoolean: boolean;
  skoncenieStretnutiaDateTime : any = {};


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
    this.stretnutieBoolean = false;
    this.ukoncenieHlasovania = false;
    this.jePoStretnutiBoolean = false;
  }

  ngOnInit() {
    this.OverOdkialIdem();
    this.resolveOrg();
    this.finalnyDatum2();
    this.resolveStr();

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
      this.vymazUserStr(userID);
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
      this.resolveStr();
    } else {
      let funkcieOrg = [];
      firebase.database().ref('organizacie/' + OrgID + '/clenovia')
        .on('child_added', (idOrgData) => {
          if(idOrgData.val() == 'owner') {
            funkcieOrg.push(idOrgData.val());
          }
        });
      //console.log(funkcieOrg.length);
      if (funkcieOrg.length > 1) {
        let userID = JSON.parse(localStorage.getItem('user')).uid;
        this.vymaz(OrgID);
        this.vymazUserStr(userID);
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
        this.resolveStr();
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
    this.vymazUserStr(person.uid);
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
    if(JSON.parse(localStorage.getItem('org')) == null){
      this.stretnutieBoolean = false;
    } else {
      this.organizaciaBooelean = false;
      this.siJedinyOwner = false;
    }
    this.udajeOsoba = person;
  }
  vratSa() {
    this.pozriUzivatela = false;
    if(JSON.parse(localStorage.getItem('org')) == null){
      this.stretnutieBoolean = true;
    } else {
      this.organizaciaBooelean = true;
    }
  }

  nie() {
    this.siJedinyOwner = false;
  }

  vymazOrg(organizaciaUID) {
    firebase.database().ref('users')
      .on("child_added", (usersData) => {
        //console.log(usersData.val());
        //console.log(usersData.key);
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

    firebase.database().ref('stretnutie')
      .on("child_added", (strData) => {
        firebase.database().ref('stretnutie/' + strData.key + "/organizacia")
          .on('value', (orgStrData) => {
            if(orgStrData.val() == organizaciaUID ) {
              firebase.database().ref('stretnutie/' + strData.key + "/clenovia")
                .on('child_added', (clenoviaStr) => {
                  firebase.database().ref('users/' + clenoviaStr.key + "/stretnutie/" + strData.key)
                    .remove();
                });
            }
          });
      });
    firebase.database().ref('stretnutie')
      .on("child_added", (strData) => {
        firebase.database().ref('stretnutie/' + strData.key + "/organizacia")
          .on('value', (orgStrData) => {
            if (orgStrData.val() == organizaciaUID) {
              firebase.database().ref('stretnutie/' + strData.key)
                .remove();
            }
          });
      });

   /*
    firebase.database().ref('organizacie/' +  organizaciaUID + '/clenovia/' + userID)
      .remove();*/
  }
  ano() {
    let OrgID = JSON.parse(localStorage.getItem('org')).uid;
    let userID = JSON.parse(localStorage.getItem('user')).uid;
    this.vymazOrg(OrgID);
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
     this.resolveStr();
  }

  stretnutia() {
    this.router.navigate(['stretnutie',]);
  }



  resolveStr(){
    let tmp = [];
    this.ukoncenieHlasovania = false;
    this.userUID = JSON.parse(localStorage.getItem('user')).uid;
    firebase.database().ref('stretnutie')
      .on('child_added', (strData)=>{
        if(strData.val().clenovia[this.userUID] != null) {
          this.finalnyDatum(strData.key);
          if(strData.val().casHlasovania != null) {
            firebase.database().ref('users/' + this.userUID + '/stretnutie/' + strData.key)
              .on("value", (strUserData) => {
                if(strUserData.val() != null) {
                  let things = {
                    "nazov": strData.val().nazovStretnutia,
                    "uid": strData.key,
                  }
                  tmp.push(things);
                }
              });
          }
        }
      });
    this.str = tmp;
  }

  strUdaje(stretnutie){
    this.stretnutieUID = stretnutie;
    this.stretnutieBoolean = true;
    this.homeBoolean = false;
    this.potvrdenaUcast = false;
    firebase.database().ref('stretnutie/' + stretnutie)
      .on('value', (dataStr)=>{
        this.udajeStr = dataStr.val();
        this.udajeStr.uid = stretnutie;
        this.potvrdenaUcast = dataStr.val().ucast[this.userUID];
      });
    this.naplnClenovStretnutia(stretnutie);
    this.jePoStretnuti(stretnutie);
  }

  jePoStretnuti(stretnutie){
    this.jePoStretnutiBoolean = false;
    firebase.database().ref('stretnutie/' + stretnutie + '/casHlasovania')
      .on('value', (datum)=> {
        this.skoncenieStretnutiaDateTime = datum.val();
      });
    console.log(this.skoncenieStretnutiaDateTime);
    let dateTime = new Date();
    let rok = this.skoncenieStretnutiaDateTime.substring(0,4);
    let mesiac = this.skoncenieStretnutiaDateTime.substring(5,7);
    let den = this.skoncenieStretnutiaDateTime.substring(8,10);
    let hodiny = this.skoncenieStretnutiaDateTime.substring(11,13);
    let minuty = this.skoncenieStretnutiaDateTime.substring(14,16);

    if (rok < dateTime.getFullYear()){
      this.jePoStretnutiBoolean = true;
    } else if (rok == dateTime.getFullYear() && mesiac < dateTime.getMonth()+1) {
      this.jePoStretnutiBoolean = true;
    } else if (mesiac == dateTime.getMonth()+1 && den < dateTime.getDate()) {
      this.jePoStretnutiBoolean = true;
    } else if (den == dateTime.getDate() && hodiny < dateTime.getHours()) {
      this.jePoStretnutiBoolean = true;
    } else if (hodiny == dateTime.getHours() && minuty < dateTime.getMinutes()){
      this.jePoStretnutiBoolean = true;
    }
  }

  vymazUserStr(user){
    let tmp;
    let orgID = JSON.parse(localStorage.getItem('org')).uid;
    firebase.database().ref('stretnutie/')
      .on('child_added', (stretnutieOrgUdaje) => {
        firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key + '/organizacia')
          .on('value', (OrganizaciaStretnutieUdaje) => {
            if(orgID == OrganizaciaStretnutieUdaje.val()){
              firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key + '/clenovia/' + user)
                .on('value', (userStretnutieUdaje) => {
                  if(userStretnutieUdaje.val() != null){
                    tmp = [];
                    firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key + '/clenovia')
                      .on("child_added", (strUserData) => {
                        tmp.push(strUserData.val());
                      });
                    if(tmp.length > 2){
                      firebase.database().ref('users/' + user + '/stretnutie/' + stretnutieOrgUdaje.key)
                        .on('value', (overCiUzNevymazal) => {
                          if(overCiUzNevymazal.val() != null){
                            console.log(stretnutieOrgUdaje.key);
                            firebase.database().ref('users/' + user + '/stretnutie/' + stretnutieOrgUdaje.key)
                              .remove();
                          }
                        })
                          if (stretnutieOrgUdaje.val().ucast != null){
                            firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key + '/ucast/' + user)
                              .remove();
                          } else{
                            firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key + '/dates')
                              .on('child_added', (dateHlasy) => {
                                console.log(dateHlasy.val().hlasy != null);
                                if(dateHlasy.val().hlasy != null){
                                  firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key + '/dates/' + dateHlasy.key + '/hlasy')
                                    .on('child_added', (hlasy) => {
                                     if(hlasy.key == user){
                                       firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key + '/dates/' + dateHlasy.key + '/hlasy/' + hlasy.key)
                                         .remove();
                                     }
                                    });
                                }
                              });
                          }

                      firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key + '/clenovia/' + user)
                        .remove();
                    } else {
                      firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key + '/clenovia')
                        .on("child_added", (strUserData) => {
                          firebase.database().ref('users/' + strUserData.key + '/stretnutie/' + stretnutieOrgUdaje.key)
                            .remove();
                          console.log(strUserData.key + '  ' + stretnutieOrgUdaje.key);
                        });
                       firebase.database().ref('stretnutie/' + stretnutieOrgUdaje.key )
                        .remove();
                    }
                  }
                });
            }
          });
      });
      this.resolveStr();
  }

  vymazStr(stretnutie){
    let tmp = [];
    firebase.database().ref('stretnutie/' + stretnutie + '/clenovia')
      .on("child_added", (strUserData) => {
        firebase.database().ref('users/' + strUserData.key + '/stretnutie/' + stretnutie)
          .on("value", (UserData) => {
            if (UserData.val() != null) {
              tmp.push(UserData.val());
            }
          });
      });
    if(tmp.length > 1){
      firebase.database().ref('users/' + this.userUID + '/stretnutie/' + stretnutie)
        .remove();
      this.resolveStr();
      this.stretnutieBoolean = false;
      this.homeBoolean = true;
    } else {
      firebase.database().ref('stretnutie/' + stretnutie)
        .remove();
      firebase.database().ref('users/' + this.userUID + '/stretnutie/' + stretnutie)
        .remove();
      this.resolveStr();
      this.stretnutieBoolean = false;
      this.homeBoolean = true;
    }
  }

  finalnyDatum(stretnutie){
    let allVoted = true;
    this.ukoncenieHlasovania = false;
    firebase.database().ref('stretnutie/' + stretnutie + '/clenovia')
      .on('child_added', (userData)=>{
        if(userData.val() == "false") {
          allVoted = false;
        }
      });
    firebase.database().ref('stretnutie/' + stretnutie + '/UkoncenieHlasovania/' + '/cas')
      .on('value', (datum)=> {
        this.ukoncenieHlasovaniaTime = datum.val();
      });
    firebase.database().ref('stretnutie/' + stretnutie + '/UkoncenieHlasovania/' + '/datum')
      .on('value', (datum)=> {
        this.ukoncenieHlasovaniaDate = datum.val();
      });
    let dateTime = new Date();
    let rok = this.ukoncenieHlasovaniaDate.substring(0,4);
    let mesiac = this.ukoncenieHlasovaniaDate.substring(5,7);
    let den = this.ukoncenieHlasovaniaDate.substring(8,10);
    let hodiny = this.ukoncenieHlasovaniaTime.substring(0,2);
    let minuty = this.ukoncenieHlasovaniaTime.substring(3,5);

    if (rok < dateTime.getFullYear()){
      this.ukoncenieHlasovania = true;
    } else if (rok == dateTime.getFullYear() && mesiac < dateTime.getMonth()+1) {

      this.ukoncenieHlasovania = true;
    } else if (mesiac == dateTime.getMonth()+1 && den < dateTime.getDate()) {

      this.ukoncenieHlasovania = true;
    } else if (den == dateTime.getDate() && hodiny < dateTime.getHours()) {

      this.ukoncenieHlasovania = true;
    } else if (hodiny == dateTime.getHours() && minuty < dateTime.getMinutes()){
      this.ukoncenieHlasovania = true;
    }

    if(allVoted || this.ukoncenieHlasovania == true){
      let finalnyDatum = '';
      let finalnyCas = '';
      let chosenDate = {
        "pocetClenov": 0,
        "pocetOwnerov": 0,
        "finalDate": ''
      };
      firebase.database().ref('stretnutie/' + stretnutie + '/dates')
        .on('child_added', (dateHlasy) =>{
          let tmp ={
            "pocetClenov": 0,
            "pocetOwnerov": 0,
            "finalDate": ''
          };
          let pocetOwnerov = 0;
          let pocetClenov = 0;
          firebase.database().ref('stretnutie/' + stretnutie + '/dates/' + dateHlasy.key + '/date')
            .on('value',(datum) =>{finalnyDatum = datum.val()})
          firebase.database().ref('stretnutie/' + stretnutie + '/dates/' + dateHlasy.key + '/time')
            .on('value',(cas) =>{finalnyCas = cas.val()})
          firebase.database().ref('stretnutie/' + stretnutie + '/dates/' + dateHlasy.key + '/hlasy')
            .on('child_added', (hlasy) => {
              if(hlasy.val() == 'owner'){
                pocetOwnerov++;
              }
              pocetClenov++
              let pocty = {
                "pocetClenov": pocetClenov,
                "pocetOwnerov": pocetOwnerov,
                "finalDate": finalnyDatum + ' ' + finalnyCas
              };
              tmp = pocty;
            })
          if (tmp.pocetClenov > chosenDate.pocetClenov){
            chosenDate = tmp;
          } else if (tmp.pocetClenov == chosenDate.pocetClenov && tmp.pocetOwnerov > chosenDate.pocetOwnerov){
            chosenDate = tmp;
          } else if (chosenDate.pocetClenov == 0 && chosenDate.finalDate == ''){
            chosenDate.finalDate =  finalnyDatum + ' ' + finalnyCas;
          }
        })
      this.casStretnutia = chosenDate.finalDate;
      // console.log(this.casStretnutia);
      firebase.database().ref('stretnutie/' + stretnutie)
        .update({
          ['casHlasovania']:  this.casStretnutia
        });
      firebase.database().ref('stretnutie/' + stretnutie)
        .on('value', (stdUdaje) => {
          if(stdUdaje.val().ucast == null){
            firebase.database().ref('stretnutie/' + stretnutie  +'/clenovia')
              .on('child_added', (userDataHelp) =>{
                firebase.database().ref('stretnutie/' + stretnutie  +'/ucast')
                  .update({
                    [userDataHelp.key]:  'false'
                  });
              });
          }
        });
    }
  }

  naplnClenovStretnutia(stretnutie){
    let tmp = [];
    let orgUID = "";
    firebase.database().ref('stretnutie/' + stretnutie)
      .on('value',(strData) => {
        orgUID = strData.val().organizacia;
      });
        firebase.database().ref('stretnutie/' + stretnutie + '/clenovia')
          .on("child_added", (strUserData) => {
            firebase.database().ref('organizacie/' + orgUID + '/clenovia/' + strUserData.key)
              .on("value", (orgUserData) => {
                firebase.database().ref('users/')
                  .on("child_added", (Data) => {
                    firebase.database().ref('stretnutie/' + stretnutie + '/ucast')
                      .on("child_added", (ucastUser) => {
                    if (strUserData.key == Data.key && ucastUser.key == Data.key) {
                      let udaje = {
                        "uid": Data.key,
                        "name": Data.val().name,
                        "pozicia": orgUserData.val(),
                        "mail": Data.val().mail,
                        "check": ucastUser.val(),
                        "meno": Data.val().meno,
                        "priezvisko": Data.val().priezvisko,
                        "adresa": Data.val().adresa,
                        "tel": Data.val().telefon
                      };
                      tmp.push(udaje);

                    }
                      });
                  });
              });
          });


    this.clenoviaStretnutia = tmp;
  }

  potvrditUcast(stretnutie) {
    firebase.database().ref('stretnutie/' + stretnutie + '/ucast')
      .update({
        [this.userUID]: 'true'
      });
    this.potvrdenaUcast = true;
    this.naplnClenovStretnutia(stretnutie);
  }


  back3() {
    this.stretnutieBoolean = false;
    this.homeBoolean = true;
  }

  finalnyDatum2(){
    this.userUID = JSON.parse(localStorage.getItem('user')).uid;
    firebase.database().ref('stretnutie')
      .on('child_added', (strData)=> {
        if (strData.val().clenovia[this.userUID] != null) {
          let allVoted = true;
          this.ukoncenieHlasovania = false;
          firebase.database().ref('stretnutie/' + strData.key + '/clenovia')
            .on('child_added', (userData) => {
              if (userData.val() == "false") {
                allVoted = false;
              }
            });
          firebase.database().ref('stretnutie/' + strData.key + '/UkoncenieHlasovania/' + '/cas')
            .on('value', (datum) => {
              this.ukoncenieHlasovaniaTime = datum.val();
            });
          firebase.database().ref('stretnutie/' + strData.key + '/UkoncenieHlasovania/' + '/datum')
            .on('value', (datum) => {
              this.ukoncenieHlasovaniaDate = datum.val();
            });
          let dateTime = new Date();
          let rok = this.ukoncenieHlasovaniaDate.substring(0, 4);
          let mesiac = this.ukoncenieHlasovaniaDate.substring(5, 7);
          let den = this.ukoncenieHlasovaniaDate.substring(8, 10);
          let hodiny = this.ukoncenieHlasovaniaTime.substring(0, 2);
          let minuty = this.ukoncenieHlasovaniaTime.substring(3, 5);

          if (rok < dateTime.getFullYear()) {
            this.ukoncenieHlasovania = true;
          } else if (rok == dateTime.getFullYear() && mesiac < dateTime.getMonth() + 1) {

            this.ukoncenieHlasovania = true;
          } else if (mesiac == dateTime.getMonth() + 1 && den < dateTime.getDate()) {

            this.ukoncenieHlasovania = true;
          } else if (den == dateTime.getDate() && hodiny < dateTime.getHours()) {

            this.ukoncenieHlasovania = true;
          } else if (hodiny == dateTime.getHours() && minuty < dateTime.getMinutes()) {
            this.ukoncenieHlasovania = true;
          }

          if (allVoted || this.ukoncenieHlasovania == true) {
            let finalnyDatum = '';
            let finalnyCas = '';
            let chosenDate = {
              "pocetClenov": 0,
              "pocetOwnerov": 0,
              "finalDate": ''
            };
            firebase.database().ref('stretnutie/' + strData.key + '/dates')
              .on('child_added', (dateHlasy) => {
                let tmp = {
                  "pocetClenov": 0,
                  "pocetOwnerov": 0,
                  "finalDate": ''
                };
                let pocetOwnerov = 0;
                let pocetClenov = 0;
                firebase.database().ref('stretnutie/' + strData.key + '/dates/' + dateHlasy.key + '/date')
                  .on('value', (datum) => {
                    finalnyDatum = datum.val()
                  })
                firebase.database().ref('stretnutie/' + strData.key + '/dates/' + dateHlasy.key + '/time')
                  .on('value', (cas) => {
                    finalnyCas = cas.val()
                  })
                firebase.database().ref('stretnutie/' + strData.key + '/dates/' + dateHlasy.key + '/hlasy')
                  .on('child_added', (hlasy) => {
                    if (hlasy.val() == 'owner') {
                      pocetOwnerov++;
                    }
                    pocetClenov++
                    let pocty = {
                      "pocetClenov": pocetClenov,
                      "pocetOwnerov": pocetOwnerov,
                      "finalDate": finalnyDatum + ' ' + finalnyCas
                    };
                    tmp = pocty;
                  })
                if (tmp.pocetClenov > chosenDate.pocetClenov) {
                  chosenDate = tmp;
                } else if (tmp.pocetClenov == chosenDate.pocetClenov && tmp.pocetOwnerov > chosenDate.pocetOwnerov) {
                  chosenDate = tmp;
                } else if (chosenDate.pocetClenov == 0 && chosenDate.finalDate == '') {
                  chosenDate.finalDate = finalnyDatum + ' ' + finalnyCas;
                }
              })
            this.casStretnutia = chosenDate.finalDate;
            // console.log(this.casStretnutia);
            firebase.database().ref('stretnutie/' + strData.key)
              .update({
                ['casHlasovania']: this.casStretnutia
              });
            firebase.database().ref('stretnutie/' + strData.key)
              .on('value', (stdUdaje) => {
                if(stdUdaje.val().ucast == null){
                  firebase.database().ref('stretnutie/' + strData.key  +'/clenovia')
                    .on('child_added', (userDataHelp) =>{
                      firebase.database().ref('stretnutie/' + strData.key  +'/ucast')
                        .update({
                          [userDataHelp.key]:  'false'
                        });
                    });
                }
              });
          }
        }
      });
  }


}



