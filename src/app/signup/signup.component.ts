import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import * as firebase from 'firebase';
import {Router} from "@angular/router";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  userRegistered: boolean;
  zlyEmail: boolean;
  constructor(private route : Router) {
    this.userRegistered = false;
    this.zlyEmail = false;
  }

  ngOnInit() {
  }
  register(f : NgForm){
    firebase.auth().createUserWithEmailAndPassword(f.value.mail, f.value.heslo)
      .then((userDataSnapshot)=>{
        let user = {
          "name" : f.value.login,
          "mail" : f.value.mail,
          "meno" : f.value.meno,
          "priezvisko" : f.value.priezvisko,
          "telefon" : f.value.tel,
          "adresa" : f.value.adresa,
        };

        firebase.database().ref('users/' + userDataSnapshot.user.uid)
          .set(user)
          .then(()=>{
            this.userRegistered = true;
            firebase.auth().signOut();
            this.route.navigate(['login',]);
          })
      })
      .catch((error)=>{
        console.log("error", error.message);
        this.zlyEmail = true;
      })
  }

}
