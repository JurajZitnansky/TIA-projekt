import { Component, OnInit } from '@angular/core';
import {FormControl, NgForm, Validators} from '@angular/forms';
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
  zleHeslo: boolean;
  prazdnyLogin: boolean;
  constructor(private router : Router) {
    this.userRegistered = false;
    this.zlyEmail = false;
    this.nazovUserBoolean = false;
    this.zleHeslo = false;
    this.prazdnyLogin = false;
  }

  ngOnInit() {
  }

  register(f : NgForm) {
    this.zlyEmail = false;
    this.zleHeslo = false;
    this.nazovUserBoolean = false;
    this.prazdnyLogin = false;
    const control = new FormControl(f.value.mail, Validators.pattern('^[a-zA-Z0-9\\._]{6,30}@[a-zA-Z0-9\\._]{1,}\\.[a-z]{2,}$'));
    //console.log(control.errors);

    if((control.errors != null) || (f.value.mail === '')){
      this.zlyEmail = true;
    }

    const control2 = new FormControl(f.value.heslo, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$'));
    //console.log(control2.errors);
    if((control2.errors != null) || (f.value.heslo === '')){
      this.zleHeslo = true;
    }


    let regUsernames = [];
    firebase.database().ref('users')
      .on('child_added', (userDataHelp) => {
        regUsernames.push(userDataHelp.val().name);
      });
    if(regUsernames.includes(f.value.login)){
      this.nazovUserBoolean = true;
    }

    if(f.value.login == ''){
      this.prazdnyLogin = true;
    }

    if (this.zleHeslo == false && this.zlyEmail == false && this.nazovUserBoolean == false && this.prazdnyLogin == false) {
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
        })
    }
  }
  login(){
    this.router.navigate(['login',]);
  }

}
