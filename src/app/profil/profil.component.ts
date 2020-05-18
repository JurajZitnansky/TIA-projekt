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
  jedinyOwner : boolean;
  klikolZrus: boolean;


  constructor(private router : Router) {
    this.user = {};
    this.zmenUdajeBoolean = false;
    this.zmenHesloBoolean = false;
    this.hesloSaZmenilo = false;
    this.jedinyOwner = false;
    this.klikolZrus = false;
  }

  ngOnInit() {
    this.overOdkialIdem();
    this.resolveUser();
  }

  zmenaUdajov(){
    this.zmenUdajeBoolean = true;
    this.klikolZrus = false;
  }
  overOdkialIdem() {
    if (JSON.parse(localStorage.getItem('org')) !== null) {
      localStorage.removeItem('org');
    }
  }

  spat(){
    this.zmenHesloBoolean = false;
    this.klikolZrus = false;
  }
  spat2(){
    this.zmenUdajeBoolean = false;
    this.klikolZrus = false;
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
            this.klikolZrus = false;
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

  overPocetOwnerov(idOrganizacie) {
    let pocetOwnerovOrg = [];
    firebase.database().ref('organizacie/' + idOrganizacie + '/clenovia')
      .on('child_added', (orgFunkcie) => {
        if (orgFunkcie.val() == 'owner') {
          pocetOwnerovOrg.push(orgFunkcie.val());
        }
      });
    if(pocetOwnerovOrg.length == 1){
      this.jedinyOwner = true;
    }
    return pocetOwnerovOrg.length;
  }

  zrusUcet(){
    this.klikolZrus = true;
    this.jedinyOwner = false;
    let userID = JSON.parse(localStorage.getItem('user')).uid;
    firebase.database().ref('users/' + userID  + '/organizacie')
      .on("child_added", (orgUdaje) =>{
        if (orgUdaje.val().funkcia =='owner') {
          let pocet = this.overPocetOwnerov(orgUdaje.key);
        }
    });
  }

  nie(){
    this.klikolZrus = false;
  }

  vymazOrg(organizaciaUID) {
    firebase.database().ref('users')
      .on("child_added", (usersData) => {
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
  }

  ano(){
    let userID = JSON.parse(localStorage.getItem('user')).uid;
    var user = firebase.auth().currentUser;
    user.delete().then(function() {
      // User deleted.
    }).catch(function(error) {
      // An error happened.
    });
    this.vymazUserStr(userID);
     if(this.jedinyOwner == false){
       firebase.database().ref('users/' + userID  + '/organizacie')
         .on("child_added", (orgUdaje) => {
           firebase.database().ref('organizacie/' + orgUdaje.key + '/clenovia/' + userID)
             .remove()
         });
     } else {
       firebase.database().ref('users/' + userID  + '/organizacie')
         .on("child_added", (orgUdaje) => {
           if (orgUdaje.val().funkcia =='owner') {
             let pocet = this.overPocetOwnerov(orgUdaje.key);
             if (pocet == 1 ){
               this.vymazOrg(orgUdaje.key)
             } else{
               firebase.database().ref('users/' + userID  + '/organizacie')
                 .on("child_added", (orgUdaje) => {
                   firebase.database().ref('organizacie/' + orgUdaje.key + '/clenovia/' + userID)
                     .remove()
                 });
             }
           }
         });
     }
     firebase.database().ref('users/' + userID)
       .remove()
    localStorage.removeItem('user');
    this.router.navigate(['',]);
   }


  vymazUserStr(user){
    let tmp;
    firebase.database().ref('stretnutie/')
      .on('child_added', (stretnutieUdaje) => {
              firebase.database().ref('stretnutie/' + stretnutieUdaje.key + '/clenovia/' + user)
                .on('value', (userStretnutieUdaje) => {
                  if(userStretnutieUdaje.val() != null){
                    tmp = [];
                    firebase.database().ref('stretnutie/' + stretnutieUdaje.key + '/clenovia')
                      .on("child_added", (strUserData) => {
                        tmp.push(strUserData.val());
                      });
                    if(tmp.length > 2){
                      if (stretnutieUdaje.val().ucast != null){
                        firebase.database().ref('stretnutie/' + stretnutieUdaje.key + '/ucast/' + user)
                          .remove();
                      } else{
                        firebase.database().ref('stretnutie/' + stretnutieUdaje.key + '/dates')
                          .on('child_added', (dateHlasy) => {
                            console.log(dateHlasy.val().hlasy != null);
                            if(dateHlasy.val().hlasy != null){
                              firebase.database().ref('stretnutie/' + stretnutieUdaje.key + '/dates/' + dateHlasy.key + '/hlasy')
                                .on('child_added', (hlasy) => {
                                  if(hlasy.key == user){
                                    firebase.database().ref('stretnutie/' + stretnutieUdaje.key + '/dates/' + dateHlasy.key + '/hlasy/' + hlasy.key)
                                      .remove();
                                  }
                                });
                            }
                          });
                      }

                      firebase.database().ref('stretnutie/' + stretnutieUdaje.key + '/clenovia/' + user)
                        .remove();
                    } else {
                      firebase.database().ref('stretnutie/' + stretnutieUdaje.key + '/clenovia')
                        .on("child_added", (strUserData) => {
                          firebase.database().ref('users/' + strUserData.key + '/stretnutie/' + stretnutieUdaje.key)
                            .remove();
                        });
                      firebase.database().ref('stretnutie/' + stretnutieUdaje.key )
                        .remove();
                    }
                  }
                });
      });
  }
}
