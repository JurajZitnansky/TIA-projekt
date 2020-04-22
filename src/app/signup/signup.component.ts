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
  nazovUserBoolean: boolean;
  userRegistered: boolean;
  zlyEmail: boolean;
  constructor(private router : Router) {
    this.userRegistered = false;
    this.zlyEmail = false;
    this.nazovUserBoolean = false;
  }

  ngOnInit() {
  }
  register(f : NgForm) {
    this.zlyEmail = false;
    this.nazovUserBoolean = false;
    let regUsernames = [];
    firebase.database().ref('users')
      .on('child_added', (userDataHelp) => {
        regUsernames.push(userDataHelp.val().name);
      });
    if (regUsernames.includes(f.value.login) ===true) {
      this.nazovUserBoolean = true;
      console.log(regUsernames.includes(f.value.login));
    } else {
      firebase.auth().createUserWithEmailAndPassword(f.value.mail, f.value.heslo)
        .then((userDataSnapshot) => {
          let user = {
            "name": f.value.login,
            "mail": f.value.mail,
            "meno": f.value.meno,
            "priezvisko": f.value.priezvisko,
            "telefon": f.value.tel,
            "adresa": f.value.adresa,
          };

          firebase.database().ref('users/' + userDataSnapshot.user.uid)
            .set(user)
            .then(() => {
              this.userRegistered = true;
              firebase.auth().signOut();
              this.router.navigate(['login',]);
            })
        })
        .catch((error) => {
          console.log("error", error.message);
            this.zlyEmail = true;
        })
    }
  }
  login(){
    this.router.navigate(['login',]);
  }

}
