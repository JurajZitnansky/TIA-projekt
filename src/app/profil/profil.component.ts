import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import * as firebase from 'firebase';
import {Router} from "@angular/router";

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

  user : any = {};
  zmenUdajeBoolean : boolean;
  zmenHesloBoolean : boolean;
  hesloSaZmenilo : boolean;


  constructor(private router : Router) {
    this.user = {};
    this.zmenUdajeBoolean = false;
    this.zmenHesloBoolean = false;
    this.hesloSaZmenilo = false;
  }

  ngOnInit() {
    this.resolveUser();
  }

  zmenaUdajov(){
    this.zmenUdajeBoolean = true;
  }

  spat(){
    this.zmenHesloBoolean = false;
  }
  spat2(){
    this.zmenUdajeBoolean = false;
  }

  zmenaHesla(){
    this.zmenHesloBoolean = true;
  }
  zmenHeslo(f : NgForm){
    let user = JSON.parse(localStorage.getItem('user'));
    let credentials = firebase.auth.EmailAuthProvider.credential(user.mail, f.value.stareHeslo);

    firebase.auth().currentUser.reauthenticateWithCredential(credentials)
      .then(()=>{
        firebase.auth().currentUser.updatePassword(f.value.noveHeslo)
          .then(()=>{
            this.hesloSaZmenilo = true;
            this.zmenHesloBoolean = false;
          })
      })
      .catch((error)=> { console.log(error.message)})
  }

  registraciaOrganizacie(){
    this.router.navigate(['registracia_organizacie', ]);
  }
  resolveUser(){
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  resolve(f : NgForm){
    console.log(f.value);
    firebase.database().ref('users/' + this.user.uid)
      .update(f.value)
      .then(()=>{
        firebase.database().ref('users/' + this.user.uid)
          .once("value", (userData)=> {
            let user = userData.val();
            user.uid = this.user.uid;
            localStorage.setItem('user', JSON.stringify(user));
            this.zmenUdajeBoolean = false;
          })
          .then(()=>{ this.resolveUser(); })
      })
      .catch((error)=>{ console.log(error.message)})
  }
}
