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

  pridajUzivatelovBoolean : boolean;
  vytvorOrganizaciuBoolean : boolean;
  idOrganicie : any;
  clenoviaOrganizacieList : any = [];
  allPeople : any = [];

  constructor(private router : Router) {
    this.pridajUzivatelovBoolean = false;
    this.vytvorOrganizaciuBoolean = true;
  }

  ngOnInit() {
  }



  pridajOrganizaciu(f : NgForm) {
    let ownerUid = JSON.parse(localStorage.getItem('user')).uid;
    let idOrganizacie = firebase.database().ref('organizacie').push(f.value).key;
    this.idOrganicie = idOrganizacie;
    console.log('som tuuuuu');
    firebase.database().ref('organizacie')
      .once("value", (orgData) => {
        const orgDATA = {
          'funkcia': 'owner',
          'nazovOrganizacie': orgData.child(idOrganizacie).val().nazovOrganizacie,
        }
        const vytvorenaOrg = {
          'uidOrganizacue' : idOrganizacie,
          'typOrganizacie': orgData.child(idOrganizacie).val().typOrganizacie,
          'nazovOrg': orgData.child(idOrganizacie).val().nazovOrganizacie,
          'icoOrganizacie': orgData.child(idOrganizacie).val().icoOrganizacie,
          'sidloOrganizacie': orgData.child(idOrganizacie).val().sidloOrganizacie,
          'webOrgnaizacie': orgData.child(idOrganizacie).val().webOrgnaizacie,
        }
        localStorage.setItem('vytvorenaOrg', JSON.stringify(vytvorenaOrg));
        firebase.database().ref('users/' + ownerUid + '/organizacie')
          .update({[idOrganizacie] : orgDATA})
          .then(() => {
            this.pridajUzivatelovDoOrganizacie(ownerUid, idOrganizacie);
          })
          .catch((error) => {console.log(error.message)});
          });

  }
  pridajUzivatelovDoOrganizacie(uid, idOrganizacie){
    firebase.database().ref('organizacie/' + idOrganizacie + '/clenovia')
      .set({[uid] : "owner" })
      .then(()=>{
        this.vytvorOrganizaciuBoolean = false;
        this.pridajUzivatelovBoolean = true;
        this.naplnClenovOrganizacie();
        this.naplnAllPeople();
      })
  }

  naplnAllPeople(){
    let tmp = [];
    firebase.database().ref('users/')
      .on("child_added", (userData)=>{
        if((!userData.val().organizacie || !userData.val().organizacie[this.idOrganicie]) && this.allPeople.indexOf(userData) == -1){
          tmp.push(userData);
        }
      });
    this.allPeople = tmp;
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

  addPerson(person, str){
    const udaje = {
      'funkcia': str,
      'nazovOrganizacie': JSON.parse(localStorage.getItem('vytvorenaOrg')).nazovOrg,
    };
    firebase.database().ref('users/' + person.key + '/organizacie')
      .update({
        [this.idOrganicie] : udaje
      });
    firebase.database().ref('organizacie/' + this.idOrganicie + '/clenovia')
      .update({
        [person.key] : str
      });
    this.naplnAllPeople();
    this.naplnClenovOrganizacie();
  }

  vymaz(person) {
    firebase.database().ref('users/' + person.uid + '/organizacie/' + this.idOrganicie)
      .remove();
    firebase.database().ref('organizacie/' + this.idOrganicie + '/clenovia/' + person.uid)
      .remove();
    this.naplnAllPeople();
    this.naplnClenovOrganizacie();
  }

  back() {
    this.router.navigate(['profil', ]);
    localStorage.removeItem('vytvorenaOrg');
  }
  zrus() {
    this.router.navigate(['profil',]);
  }
}
