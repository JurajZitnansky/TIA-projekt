import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import * as firebase from 'firebase';
import {Router} from "@angular/router";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  zleHeslo : boolean;
  zlyEmail: boolean;

  constructor(private router : Router) {
    this.zleHeslo = false;
    this.zlyEmail = false;
  }

  ngOnInit() {
  }

  login(f : NgForm){
    firebase.auth().signInWithEmailAndPassword(f.value.mail, f.value.heslo)
      .then((userDataSnapshot)=>{
        firebase.database().ref('users/' + userDataSnapshot.user.uid)
          .once("value", (userData)=>{
            let user = userData.val();
            user.uid = userDataSnapshot.user.uid;
            console.log(user);
            localStorage.setItem('user', JSON.stringify(user));
            this.router.navigate(['home',])
          })
          .catch((error)=>{
            console.log("error", error.message);
          });
      })
      .catch((error)=>{
        if(f.value.mail.includes('@')){
          this.zleHeslo = true;
        } else {
          this.zlyEmail = true;
        }
        console.log(error.message);
      })
  }
  signup(){
    this.router.navigate(['signup',]);
  }
}
