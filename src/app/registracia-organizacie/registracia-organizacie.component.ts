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



  pridajOrganizaciu(f : NgForm){
    let ownerUid = JSON.parse(localStorage.getItem('user')).uid;
    let idOrganizacie = firebase.database().ref('organizacie').push(f.value).key;
    this.idOrganicie = idOrganizacie;
    firebase.database().ref('users/' + ownerUid + '/organizacie')
      .update({[idOrganizacie] : "owner"})
      .then(()=>{
        this.pridajUzivatelovDoOrganizacie(ownerUid, idOrganizacie);
      })
      .catch((error)=>{console.log(error.message)});
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
    firebase.database().ref('users/' + person.key + '/organizacie')
      .update({
        [this.idOrganicie] : str
      })
      .then(()=>{
        firebase.database().ref('organizacie/' + this.idOrganicie + '/clenovia')
          .update({
            [person.key] : str
          })
      });
    this.naplnAllPeople();
    this.naplnClenovOrganizacie();
  }

  vymaz(person){
    firebase.database().ref('users/' + person.uid + '/organizacie/' + this.idOrganicie)
      .remove()
      .then(()=>{
        firebase.database().ref('organizacie/' + this.idOrganicie + '/clenovia/' + person.uid)
          .remove()
          .then(()=>{
            this.naplnAllPeople();
            this.naplnClenovOrganizacie();
          })
      })
  }


  back(){
    this.router.navigate(['profil', ]);
  }
  zrus(){
    this.router.navigate(['profil',]);
  }
}
