import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import * as firebase from 'firebase';
import {Router} from "@angular/router";



@Component({
  selector: 'app-registracia-organizacie',
  templateUrl: './registracia-organizacie.component.html',
  styleUrls: ['./registracia-organizacie.component.css']
})
export class RegistraciaOrganizacieComponent implements OnInit {

  pridajUzivatelovBoolean: boolean;
  vytvorOrganizaciuBoolean: boolean;
  nazovOrganizacieBoolean: boolean;
  uzJeClen: boolean;
  najdenyUzivatel: boolean;
  neexistuje: boolean;
  neniOwner: boolean;
  idOrganicie: any;
  idOrgName: any;
  clenoviaOrganizacieList: any = [];
  údaj: any ;
  login: any;
  email: any;
  najdenyUzivatelID: any;

  constructor(private router : Router) {
    this.pridajUzivatelovBoolean = false;
    this.vytvorOrganizaciuBoolean = true;
    this.neexistuje = false;
    this.uzJeClen = false;
    this.najdenyUzivatel = false;
    this.nazovOrganizacieBoolean = false;
    this.neniOwner = false;
  }

  ngOnInit() {
  }

  pridajOrganizaciu(f : NgForm) {
    let ownerUid = JSON.parse(localStorage.getItem('user')).uid;
    let nazvyOrg = [];
    firebase.database().ref('organizacie')
      .on('child_added', (orgDataHelp) => {
        nazvyOrg.push(orgDataHelp.val().nazovOrganizacie);
      });
    if(nazvyOrg.includes(f.value.nazovOrganizacie)){
      this.nazovOrganizacieBoolean = true;
    } else {
      let idOrganizacie = firebase.database().ref('organizacie').push(f.value).key;
      this.idOrganicie = idOrganizacie;
      this.idOrgName = f.value.nazovOrganizacie;
      firebase.database().ref('organizacie')
        .once("value", (orgData) => {
          const orgDATA = {
            'funkcia': 'owner',
            'nazovOrganizacie': orgData.child(idOrganizacie).val().nazovOrganizacie,
          }
          /* const vytvorenaOrg = {
             'uidOrganizacie' : idOrganizacie,
             'typOrganizacie': orgData.child(idOrganizacie).val().typOrganizacie,
             'nazovOrg': orgData.child(idOrganizacie).val().nazovOrganizacie,
             'icoOrganizacie': orgData.child(idOrganizacie).val().icoOrganizacie,
             'sidloOrganizacie': orgData.child(idOrganizacie).val().sidloOrganizacie,
             'webOrgnaizacie': orgData.child(idOrganizacie).val().webOrgnaizacie,
           }
           localStorage.setItem('vytvorenaOrg', JSON.stringify(vytvorenaOrg));*/
          firebase.database().ref('users/' + ownerUid + '/organizacie')
            .update({[idOrganizacie]: orgDATA})
            .then(() => {
              this.pridajUzivatelovDoOrganizacie(ownerUid, idOrganizacie);
            })
            .catch((error) => {
              console.log(error.message)
            });
        });
    }

  }
  pridajUzivatelovDoOrganizacie(uid, idOrganizacie){
    firebase.database().ref('organizacie/' + idOrganizacie + '/clenovia')
      .set({[uid] : "owner" })
      .then(()=>{
        this.vytvorOrganizaciuBoolean = false;
        this.pridajUzivatelovBoolean = true;
        this.naplnClenovOrganizacie();
      })
  }



  naplnClenovOrganizacie(){
    let tmp = [];
    firebase.database().ref('organizacie/' + this.idOrganicie + '/clenovia')
      .on("child_added", (userData)=> {
        firebase.database().ref('users/' + userData.key)
          .on("value", (userDataSnapshot) => {
            let user = {
              "name": userDataSnapshot.val().name,
              "pozicia": userData.val(),
              "uid": userDataSnapshot.key
            };
            if(this.clenoviaOrganizacieList.indexOf(user) == -1) tmp.push(user);
          })
      });
    this.clenoviaOrganizacieList = tmp;
  }

  vymaz(person) {
    firebase.database().ref('users/' + person.uid + '/organizacie/' + this.idOrganicie)
      .remove();
    firebase.database().ref('organizacie/' + this.idOrganicie + '/clenovia/' + person.uid)
      .remove();
    this.naplnClenovOrganizacie();
  }

  potvrd() {
    let funkcieOrg = [];
    firebase.database().ref('organizacie/' + this.idOrganicie + '/clenovia')
      .on('child_added', (idOrgData) => {
        console.log(idOrgData.val());
        funkcieOrg.push(idOrgData.val());
      });
    if(funkcieOrg.includes('owner')) {
      this.router.navigate(['home',]);
      let userID = JSON.parse(localStorage.getItem('user')).uid;
      firebase.database().ref('users/' + userID)
        .once("value", (userData)=> {
          let user = userData.val();
          user.uid = userID;
          localStorage.removeItem('user');
          console.log(user);
          localStorage.setItem('user', JSON.stringify(user));
        });
      //localStorage.removeItem('vytvorenaOrg');
    } else {
      this.neniOwner = true;
    }
  }
  zrus() {
    this.router.navigate(['profil',]);
  }
  vyhladaj(str) {
    let pole = [];
    this.uzJeClen = false;
    this.najdenyUzivatel = false;
    this.neexistuje = false;
    this.neniOwner = false;
   // const orgID =  JSON.parse(localStorage.getItem('vytvorenaOrg')).uidOrganizacie;
    const orgID = this.idOrganicie
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
    console.log(person);
    this.neniOwner = false;
    const udaje = {
      'funkcia': str,
      //'nazovOrganizacie': JSON.parse(localStorage.getItem('vytvorenaOrg')).nazovOrg,
      'nazovOrganizacie' : this.idOrgName,
    };
    firebase.database().ref('users/' + person + '/organizacie')
      .update({
        [this.idOrganicie] : udaje
      });
    firebase.database().ref('organizacie/' + this.idOrganicie + '/clenovia')
      .update({
        [person] : str
      });
    this.naplnClenovOrganizacie();
    }

}

