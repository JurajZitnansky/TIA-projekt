import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import {Router} from "@angular/router";
import {NgForm, NgModel} from '@angular/forms';


@Component({
  selector: 'app-stretnutie',
  templateUrl: './stretnutie.component.html',
  styleUrls: ['./stretnutie.component.css']
})
export class StretnutieComponent implements OnInit {
  organizaciaID : any = [];
  allPeople : any = [];
  idStretnutie : any;
  dates : any = [];
  vyberUzivatelovBoolean : boolean;
  pridajStretnutieBoolean :boolean;
  stretnutieUID : any;
  requestDates: boolean;
  hodinaPlus: boolean;
  casUkoncenia: any;
  datumUkoncenia: any;
  hodinaPlusOdUkoncenia: boolean;
  asponDvajaBoolean: boolean;
  pocitadlo: number;
  chybaNazovBoolean: boolean;
  chybaTerminUzavretiaBoolean: boolean;
  chybaTerminStretnutia: boolean;
  organizaciaUID: any = {};
  userUID : any = {};
  str : any = {};
  stretnutieUdaje : any = {};
  udajeStr : any = {};
  stretnutieBoolean: boolean;
  clenovia: any = [];
  hlasovanie: boolean;
  datesNaHlasovanie : any = [];
  strHlasovanieUID: any;
  zahlasovane: boolean;
  casStretnutia: any = {};
  ukoncenieHlasovania: boolean;
  ukoncenieHlasovaniaDate : any = {};
  ukoncenieHlasovaniaTime : any = {};
  strDataHelp : any = {};
  uzMaFinalDatum: boolean;
  uzJePoHlasovani: boolean;
  rovnakyCas: any = [];
  rovnakyDatum: any = [];
  mozemVytoritStretnutie: boolean;
  pozretieHlasovania: boolean;
  datesHlasovania : any = [];
  somVyhodeny: boolean;
  pocetClenovOrg: number;
  pocetMemberov: number;
  organizaciaZrusena: boolean;


  constructor(private router : Router) {
    this.vyberUzivatelovBoolean = false;
    this.pridajStretnutieBoolean = false;
    this.requestDates = false;
    this.hodinaPlus = false;
    this.hodinaPlusOdUkoncenia = false;
    this.pocitadlo = 0;
    this.chybaNazovBoolean = false;
    this.chybaTerminStretnutia = false;
    this.stretnutieBoolean = false;
    this.hlasovanie = false;
    this.zahlasovane = false;
    this.ukoncenieHlasovania = false;
    this.uzMaFinalDatum = false;
    this.uzJePoHlasovani = false;
    this.mozemVytoritStretnutie = false;
    this.pozretieHlasovania = false;
    this.somVyhodeny = false;
    this.organizaciaZrusena = false;
  }

  ngOnInit() {
    this.pocetClenov();

  }

  resolveStr(){
    let tmp = [];
    this.userUID = JSON.parse(localStorage.getItem('user')).uid;
    this.organizaciaUID = JSON.parse(localStorage.getItem('org')).uid;
    this.viacAkoDvaja(this.organizaciaUID);
    firebase.database().ref('stretnutie')
      .on('child_added', (strData)=>{
        if((strData.val().organizacia == this.organizaciaUID) && strData.val().clenovia[this.userUID] != null ){
          //this.finalnyDatum(strData.key);
          if(strData.val().casHlasovania == null) {
            firebase.database().ref('users/' + this.userUID + '/stretnutie/' + strData.key)
              .on("value", (zahlasovalUser) => {
                let things = {
                  "nazov": strData.val().nazovStretnutia,
                  "uid": strData.key,
                  "zahlasovane": zahlasovalUser.val()
                }
                tmp.push(things);
              });
          }
        }
      });
    this.str = tmp;
  }

  strUdaje(stretnutie){
        this.stretnutieBoolean = true;
        firebase.database().ref('stretnutie/' + stretnutie)
          .on('value', (dataStr) => {
            this.udajeStr = dataStr.val();
            this.udajeStr.uid = stretnutie;
            console.log(this.udajeStr);
          });
        this.naplnClenov(stretnutie);
  }

  naplnClenov(stretnutie){
    let tmp = [];
    firebase.database().ref('stretnutie/' + stretnutie + '/clenovia')
      .on("child_added", (userData) => {
        firebase.database().ref('users/')
          .on("child_added", (Data) => {
            if (userData.key == Data.key) {
              let udaje = {
                "uid": Data.key,
                "name": Data.val().name,
                "pozicia": Data.val().organizacie[this.organizaciaUID].funkcia,
                "mail": Data.val().mail,
              };
              tmp.push(udaje);
            }
          });
      });
    this.clenovia = tmp;
  }

  zahlasovaneStr(stretnutie){
        this.pozretieHlasovania = true;
        this.uzJePoHlasovani = false;
        this.strHlasovanieUID = stretnutie;
        this.finalnyDatum(stretnutie);
        firebase.database().ref('stretnutie/' + stretnutie + '/casHlasovania')
          .on('value', (cas) => {
            if (cas.val() != null) {
              this.uzJePoHlasovani = true;
            }
          })
        this.resolveDatesHlasovania(stretnutie);
  }

  resolveDatesHlasovania(stretnutie){
    let tmp = [];
    let userID = JSON.parse(localStorage.getItem('user')).uid;
    firebase.database().ref('stretnutie/' + stretnutie + '/dates')
      .on("child_added", (date)=>{
        let hlasovalSom = false;
        firebase.database().ref('stretnutie/' + stretnutie + '/dates/'+ date.key + '/hlasy/' + userID)
          .on("value", (dateHlasy)=> {
            if(dateHlasy.val() != null){
              hlasovalSom = true;
            }
          });
        let udaje = {
          "date": date.val().date,
          "time": date.val().time,
          "check": hlasovalSom,
          "uid": date.key
        };
        tmp.push(udaje);
      });
    this.datesHlasovania = tmp;
  }

  hlasuj(stretnutie){
        this.hlasovanie = true;
        this.uzJePoHlasovani = false;
        this.strHlasovanieUID = stretnutie;
        this.finalnyDatum(stretnutie);
        firebase.database().ref('stretnutie/' + stretnutie + '/casHlasovania')
          .on('value', (cas) => {
            if (cas.val() != null) {
              this.uzJePoHlasovani = true;
            }
          })
        this.resolveDatesNaHlasovanie(stretnutie);
  }

  resolveDatesNaHlasovanie(stretnutie){
    let tmp = [];
    firebase.database().ref('stretnutie/' + stretnutie + '/dates')
      .on("child_added", (date)=>{
        let udaje = {
          "date": date.val().date,
          "time": date.val().time,
          "uid": date.key
        };
        tmp.push(udaje);
      });
    this.datesNaHlasovanie = tmp;
  }
  hlas(date){
    date.check = !date.check;
    let OrgID = JSON.parse(localStorage.getItem('org')).uid;
    let userFunkcia = (JSON.parse(localStorage.getItem('user')).organizacie[OrgID].funkcia);
    if(date.check == true) {
      firebase.database().ref('stretnutie/' +  this.strHlasovanieUID + '/dates/' + date.uid + '/hlasy')
        .update({
          [this.userUID]: userFunkcia
        })
    } else {
      firebase.database().ref('stretnutie/' +  this.strHlasovanieUID  + '/dates/' + date.uid + '/hlasy/' + this.userUID)
        .remove()
    }
  }

  zahlasuj(){
        this.poTermine(this.strHlasovanieUID);
        if (this.ukoncenieHlasovania != true) {

          firebase.database().ref('users/' + this.userUID + '/stretnutie')
            .update({
              [this.strHlasovanieUID]: "true"
            });
          firebase.database().ref('stretnutie/' + this.strHlasovanieUID + '/clenovia')
            .update({
              [this.userUID]: "true"
            });
          this.zahlasovane = true;
          this.hlasovanie = false;
          firebase.database().ref('users/' + this.userUID)
            .once("value", (userData) => {
              let user = userData.val();
              user.uid = this.userUID;
              localStorage.removeItem('user');
              localStorage.setItem('user', JSON.stringify(user));
            });


          this.finalnyDatum(this.strHlasovanieUID);
          this.resolveStr();
        } else {
          firebase.database().ref('stretnutie/' + this.strHlasovanieUID + '/dates')
            .on('child_added', (dateUdaje) => {
              firebase.database().ref('stretnutie/' + this.strHlasovanieUID + '/dates/' + dateUdaje.key + '/hlasy/' + this.userUID)
                .remove()
            })
          this.finalnyDatum(this.strHlasovanieUID);
          this.resolveStr();
        }
  }

  poTermine(stretnutie){
    this.ukoncenieHlasovania = false;
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
  }

  finalnyDatum(stretnutie){
    let allVoted = true;
    this.ukoncenieHlasovania = false;
    this.uzMaFinalDatum = false;
    firebase.database().ref('stretnutie/' + stretnutie + '/clenovia')
      .on('child_added', (userData)=>{
        if(userData.val() == "false") {
          allVoted = false;
        }
      });
    //console.log(allVoted + ' ' + stretnutie);
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

    if(allVoted || this.ukoncenieHlasovania == true ){
      firebase.database().ref('stretnutie/' + stretnutie)
        .on('value', (cas)=> {
          if (cas.val().casHlasovania != null){
            this.uzMaFinalDatum = true;
          }
        });
      if(this.uzMaFinalDatum == false) {
        // console.log('som tu a mal by som pridat finalny datum');
        let finalnyDatum = '';
        let finalnyCas = '';
        let chosenDate = {
          "pocetClenov": 0,
          "pocetOwnerov": 0,
          "finalDate": ''
        };
        firebase.database().ref('stretnutie/' + stretnutie + '/dates')
          .on('child_added', (dateHlasy) => {
            let tmp = {
              "pocetClenov": 0,
              "pocetOwnerov": 0,
              "finalDate": ''
            };
            let pocetOwnerov = 0;
            let pocetClenov = 0;
            firebase.database().ref('stretnutie/' + stretnutie + '/dates/' + dateHlasy.key + '/date')
              .on('value', (datum) => {
                finalnyDatum = datum.val()
              })
            firebase.database().ref('stretnutie/' + stretnutie + '/dates/' + dateHlasy.key + '/time')
              .on('value', (cas) => {
                finalnyCas = cas.val()
              })
            firebase.database().ref('stretnutie/' + stretnutie + '/dates/' + dateHlasy.key + '/hlasy')
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
              chosenDate.finalDate =  finalnyDatum + ' ' + finalnyCas;
            }
          })
        this.casStretnutia = chosenDate.finalDate;
        firebase.database().ref('stretnutie/' + stretnutie)
          .update({
            ['casHlasovania']: this.casStretnutia
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
  }

  resolveDates(){
    let tmp = [];
    firebase.database().ref('stretnutie/' + this.stretnutieUID + '/dates')
      .on("child_added", (date)=>{
        let udaje = {
          "date": date.val().date,
          "time": date.val().time,
          "uid": date.key,
          "check": false
        };
        tmp.push(udaje);
      });
    this.dates = tmp;
  }

  pridajDatum(g : NgForm){
    this.hodinaPlusOdUkoncenia = false;
    let rok = g.value.date.substring(0,4);
    let mesiac = g.value.date.substring(5,7);
    let den = g.value.date.substring(8,10);
    let hodiny = g.value.time.substring(0,2);
    let minuty = g.value.time.substring(3,5);
    let hodinaUkoncecnia = this.casUkoncenia.substring(0,2);

    let CelyDate = g.value.date + ' '+ g.value.time;

    if(!this.rovnakyCas.includes(g.value.date +' '+ g.value.time)){
      if (rok > this.datumUkoncenia.substring(0,4) && mesiac !="" && den != "" && hodiny != "" && minuty != ""){
        firebase.database().ref('stretnutie/' + this.stretnutieUID + "/dates")
          .push(g.value)
          .then(()=>{
            this.rovnakyCas.push(g.value.date +' ' + g.value.time);
            this.resolveDates();
          });
      } else if (rok == this.datumUkoncenia.substring(0,4) && mesiac > this.datumUkoncenia.substring(5,7) && den != "" && hodiny != "" && minuty != "") {
        firebase.database().ref('stretnutie/' + this.stretnutieUID + "/dates")
          .push(g.value)
          .then(()=>{
            this.rovnakyCas.push(g.value.date +' ' + g.value.time);
            this.resolveDates();
          });
      } else if (mesiac == this.datumUkoncenia.substring(5,7) && den > this.datumUkoncenia.substring(8,10) && hodiny != "" && minuty != "") {
        firebase.database().ref('stretnutie/' + this.stretnutieUID + "/dates")
          .push(g.value)
          .then(()=>{
            this.rovnakyCas.push(g.value.date +' ' + g.value.time);
            this.resolveDates();
          });
      } else if (den == this.datumUkoncenia.substring(8,10) && hodiny > parseInt(hodinaUkoncecnia )+ 1 && minuty != "") {
        firebase.database().ref('stretnutie/' + this.stretnutieUID + "/dates")
          .push(g.value)
          .then(()=>{
            this.rovnakyCas.push(g.value.date +' ' + g.value.time);
            this.resolveDates();
          });
      } else if (hodiny == parseInt(hodinaUkoncecnia )+ 1 && minuty >= this.casUkoncenia.substring(3,5)){
        firebase.database().ref('stretnutie/' + this.stretnutieUID + "/dates")
          .push(g.value)
          .then(()=>{
            this.rovnakyCas.push(g.value.date +' ' + g.value.time);
            this.resolveDates();
          });
      }
      else if (hodiny == parseInt(hodinaUkoncecnia )+ 1  && minuty < this.casUkoncenia.substring(3,5) || hodiny == this.casUkoncenia.substring(0,2) && minuty > this.casUkoncenia.substring(3,5)){
        this.hodinaPlusOdUkoncenia = true;
      }
    }

  }

  pridajCasNaHlasovanie(h : NgForm){
    this.hodinaPlus = false;
    this.requestDates = false;
    this.chybaTerminUzavretiaBoolean = true;
    let dateTime = new Date();
    this.casUkoncenia = h.value.cas;
    this.datumUkoncenia = h.value.datum;
    let rok = this.datumUkoncenia.substring(0,4);
    let mesiac = this.datumUkoncenia.substring(5,7);
    let den = this.datumUkoncenia.substring(8,10);
    let hodiny = this.casUkoncenia.substring(0,2);
    let minuty = this.casUkoncenia.substring(3,5);
    if (rok > dateTime.getFullYear()&& mesiac !="" && den != "" && hodiny != "" && minuty != ""){
      this.requestDates = true;
      this.chybaTerminUzavretiaBoolean = false;
      firebase.database().ref('stretnutie/' + this.stretnutieUID + "/UkoncenieHlasovania")
        .set(h.value);
    } else if (rok == dateTime.getFullYear() && mesiac > dateTime.getMonth()+1 && den != "" && hodiny != "" && minuty != "") {
      this.requestDates = true;
      this.chybaTerminUzavretiaBoolean = false;
      firebase.database().ref('stretnutie/' + this.stretnutieUID + "/UkoncenieHlasovania")
        .set(h.value);
    } else if (mesiac == dateTime.getMonth()+1 && den > dateTime.getDate() && hodiny != "" && minuty != "") {
      this.requestDates = true;
      this.chybaTerminUzavretiaBoolean = false;
      firebase.database().ref('stretnutie/' + this.stretnutieUID + "/UkoncenieHlasovania")
        .set(h.value);
    } else if (den == dateTime.getDate() && hodiny > dateTime.getHours()+1 && minuty != "") {
      this.requestDates = true;
      this.chybaTerminUzavretiaBoolean = false;
      firebase.database().ref('stretnutie/' + this.stretnutieUID + "/UkoncenieHlasovania")
        .set(h.value);
    } else if (hodiny == dateTime.getHours()+1 && minuty >= dateTime.getMinutes()){
      this.requestDates = true;
      this.chybaTerminUzavretiaBoolean = false;
      firebase.database().ref('stretnutie/' + this.stretnutieUID + "/UkoncenieHlasovania")
        .set(h.value);
    }
    else if (hodiny == dateTime.getHours()+1  && minuty < dateTime.getMinutes() || hodiny == dateTime.getHours() && minuty > dateTime.getMinutes()){
      this.hodinaPlus = true;
    }
  }

  pridajStretnutie(f : NgForm){
    this.asponDvajaBoolean = false;
    this.chybaNazovBoolean = false;
    this.chybaTerminStretnutia = false;
    this.organizaciaID = JSON.parse(localStorage.getItem('org')).uid;
    f.value.organizacia = this.organizaciaID;
    if((f.value.nazovStretnutia == "" || f.value.miestoStretnutia == "" ) && this.pocitadlo < 2 && (this.chybaTerminUzavretiaBoolean == undefined || this.chybaTerminUzavretiaBoolean == true)){
      this.asponDvajaBoolean = true;
      this.chybaNazovBoolean = true;
      this.chybaTerminUzavretiaBoolean = true;
    }
    else if((f.value.nazovStretnutia == "" || f.value.miestoStretnutia == "" ) && this.pocitadlo < 2 &&  this.dates.length < 1){
      this.asponDvajaBoolean = true;
      this.chybaNazovBoolean = true;
      this.chybaTerminStretnutia = true;
    }
    else if ((f.value.nazovStretnutia == "" || f.value.miestoStretnutia == "" ) && (this.chybaTerminUzavretiaBoolean == undefined || this.chybaTerminUzavretiaBoolean == true)){
      this.chybaNazovBoolean = true;
      this.chybaTerminUzavretiaBoolean = true;
      this.asponDvajaBoolean = false;
    }
    else if (this.pocitadlo < 2 && (this.chybaTerminUzavretiaBoolean == undefined || this.chybaTerminUzavretiaBoolean == true)){
      this.asponDvajaBoolean = true;
      this.chybaTerminUzavretiaBoolean = true;
      this.chybaNazovBoolean = false;
    }
    else if (this.pocitadlo < 2 && (f.value.nazovStretnutia == "" || f.value.miestoStretnutia == "" )){
      this.asponDvajaBoolean = true;
      this.chybaTerminUzavretiaBoolean = false;
      this.chybaNazovBoolean = true;
    }
    else if ((f.value.nazovStretnutia == "" || f.value.miestoStretnutia == "" ) && this.dates.length < 1){
      this.asponDvajaBoolean = false;
      this.chybaNazovBoolean = true;
      this.chybaTerminStretnutia = true;
    }
    else if (this.pocitadlo < 2 && this.dates.length < 1){
      this.asponDvajaBoolean = true;
      this.chybaTerminStretnutia = true;
      this.chybaNazovBoolean = false;
    }
    else if (this.dates.length < 1 && this.chybaTerminUzavretiaBoolean == false){
      this.asponDvajaBoolean = false;
      this.chybaNazovBoolean = false;
      this.chybaTerminStretnutia = true;
    }
    else if (this.chybaTerminUzavretiaBoolean == undefined || this.chybaTerminUzavretiaBoolean == true){
      this.asponDvajaBoolean = false;
      this.chybaTerminUzavretiaBoolean = true;
      this.chybaNazovBoolean = false;
    }
    else if (this.pocitadlo < 2 ){
      this.asponDvajaBoolean = true;
      this.chybaTerminUzavretiaBoolean = false;
      this.chybaNazovBoolean = false;
    }
    else if ((f.value.nazovStretnutia == "" || f.value.miestoStretnutia == "" )){
      this.asponDvajaBoolean = false;
      this.chybaTerminUzavretiaBoolean = false;
      this.chybaNazovBoolean = true;
    }
    else if(this.chybaTerminUzavretiaBoolean == false && this.dates.length < 1){
      this.chybaTerminStretnutia = true;
    }
    else if(this.pocitadlo >= 2 && this.dates.length == 1) {
      this.rovnakyCas =[];
      firebase.database().ref('stretnutie/' + this.stretnutieUID).update(f.value);
      firebase.database().ref('stretnutie/' + this.stretnutieUID + '/dates')
        .on("child_added", (date)=>{
          firebase.database().ref('stretnutie/' + this.stretnutieUID)
            .update({
              ['casHlasovania']: date.val().date + ' ' + date.val().time
            });
        });
      firebase.database().ref('stretnutie/' + this.stretnutieUID)
        .on('value', (stdUdaje) => {
          if(stdUdaje.val().ucast == null){
            firebase.database().ref('stretnutie/' + this.stretnutieUID  +'/clenovia')
              .on('child_added', (userDataHelp) =>{
                firebase.database().ref('stretnutie/' + this.stretnutieUID  +'/ucast')
                  .update({
                    [userDataHelp.key]:  'false'
                  });
              });
          }
        });
      this.pridajStretnutieBoolean = false;
      this.requestDates = false;
      this.dates = [];
      firebase.database().ref('users/' + this.userUID)
        .once("value", (userData)=> {
          let user = userData.val();
          user.uid = this.userUID;
          localStorage.removeItem('user');
          localStorage.setItem('user', JSON.stringify(user));
        });
      this.resolveStr();
    }
    else if(this.pocitadlo >= 2 && this.dates.length > 1) {
      this.rovnakyCas =[];
      firebase.database().ref('stretnutie/' + this.stretnutieUID).update(f.value);
      this.pridajStretnutieBoolean = false;
      this.requestDates = false;
      this.dates = [];
      firebase.database().ref('users/' + this.userUID)
        .once("value", (userData)=> {
          let user = userData.val();
          user.uid = this.userUID;
          localStorage.removeItem('user');
          localStorage.setItem('user', JSON.stringify(user));
        });
      this.resolveStr();
    }
  }


  naplnAllPeople(organizacia){
    let tmp = [];
    let OrgID = JSON.parse(localStorage.getItem('org')).uid;
    let userFunkcia = (JSON.parse(localStorage.getItem('user')).organizacie[OrgID].funkcia);
    if (userFunkcia == 'owner') {
      firebase.database().ref('organizacie/' + organizacia + '/clenovia')
        .on("child_added", (userData) => {
          //console.log(userData.key);
          firebase.database().ref('users/')
            .on("child_added", (Data) => {
              //console.log(Data.key);
              if (userData.key == Data.key) {
                //console.log(Data.val());
                let udaje = {
                  "uid": Data.key,
                  "name": Data.val().name,
                  "pozicia": userData.val(),
                  "mail": Data.val().mail,
                  "check": false
                };
                tmp.push(udaje);
              }
            });
        });
    } else {
      firebase.database().ref('organizacie/' + organizacia + '/clenovia')
        .on("child_added", (userData) => {
          //console.log(userData.key);
          firebase.database().ref('users/')
            .on("child_added", (Data) => {
              //console.log(Data.key);
              if (userData.key == Data.key) {
                if(userData.val() == 'member') {
                  let udaje = {
                    "uid": Data.key,
                    "name": Data.val().name,
                    "pozicia": userData.val(),
                    "mail": Data.val().mail,
                    "check": false
                  };
                  tmp.push(udaje);
                }
              }
            });
        });
    }
    this.allPeople = tmp;
  }

  pridajStretnutieButton(){
        this.pridajStretnutieBoolean = true;
        this.asponDvajaBoolean = false;
        this.chybaNazovBoolean = false;
        this.chybaTerminStretnutia = false;
        this.naplnAllPeople(JSON.parse(localStorage.getItem('org')).uid);
        this.stretnutieUID = firebase.database().ref('stretnutie/').push('').key;
  }

  back() {
        this.router.navigate(['home',]);
      }

  back2() {
    this.pridajStretnutieBoolean = false;
    this.requestDates = false;
    this.dates = [];
    firebase.database().ref('users/')
      .on("child_added", (personUdaje) => {
        firebase.database().ref('users/' + personUdaje.key + '/stretnutie/' + this.stretnutieUID)
          .remove();
      });
    firebase.database().ref('stretnutie/' + this.stretnutieUID)
      .remove();
    this.resolveStr();
  }
  back3() {
        this.stretnutieBoolean = false;
        this.finalnyDatum(this.stretnutieUID);
        this.resolveStr();
  }
  back4() {
        this.hlasovanie = false;
        firebase.database().ref('stretnutie/' + this.strHlasovanieUID + '/dates/')
          .on("child_added", (dates) => {
            firebase.database().ref('stretnutie/' + this.strHlasovanieUID + '/dates/' + dates.key + '/hlasy/' + this.userUID)
              .remove()
          });
        this.finalnyDatum(this.strHlasovanieUID);
        this.resolveStr();
  }

  back5() {
    this.pozretieHlasovania = false;
    this.finalnyDatum(this.stretnutieUID);
    this.resolveStr();
  }

  checkbox(person){
    person.check = !person.check;
    console.log(person.check);
    if(person.check == true){
      this.pocitadlo++;
    } else {
      this.pocitadlo--;
    }
    if(person.check == true) {
      firebase.database().ref('users/' + person.uid + '/stretnutie')
        .update({
          [this.stretnutieUID]: "false"
        })
        .then(() => {
          firebase.database().ref('stretnutie/' + this.stretnutieUID + '/clenovia')
            .update({
              [person.uid]: "false"
            })
        });
    } else {
      firebase.database().ref('users/' + person.uid + '/stretnutie/' + this.stretnutieUID)
        .remove()
        .then(() => {
          firebase.database().ref('stretnutie/' + this.stretnutieUID + '/clenovia/' + person.uid)
            .remove()
        });
    }
  }

  odstran(date){
    firebase.database().ref('stretnutie/' + this.stretnutieUID + '/dates/' + date.uid)
      .remove();
    var index = this.rovnakyCas.indexOf(date.date +' '+ date.time);
    if (index !== -1) {
      this.rovnakyCas.splice(index, 1);
    }
    this.resolveDates();
  }

  overVyhodenie(){
    let OrgID = JSON.parse(localStorage.getItem('org')).uid;
    let UserID = JSON.parse(localStorage.getItem('user')).uid;
    this.somVyhodeny = false;
    this.organizaciaZrusena = false;
    let tmp = [];
    let tmp2 = [];
    this.naplnAllPeople(OrgID);
    firebase.database().ref('users/' + UserID)
      .once("value", (userData)=> {
        let user = userData.val();
        user.uid = UserID;
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(user));
      });
    firebase.database().ref('organizacie/' + OrgID + '/clenovia')
      .on('child_added', (userData) => {
        tmp2.push(userData.key);
        if (userData.key == UserID){
          tmp.push(userData.key);
        }
      });
    console.log(tmp.length);
    console.log(this.pocetClenovOrg);
    if (tmp.length == 0 && this.pocetClenovOrg == 0){
      this.organizaciaZrusena = true;
      this.stretnutieBoolean = false;
      this.hlasovanie = false;
      this.pridajStretnutieBoolean = false;
      localStorage.removeItem('org');
    } else if (tmp.length == 0 && this.pocetClenovOrg != 0){
      this.somVyhodeny = true;
      this.stretnutieBoolean = false;
      this.hlasovanie = false;
      this.pridajStretnutieBoolean = false;
      localStorage.removeItem('org');
    }
  }
  back6(){
    this.somVyhodeny = false;
    this.router.navigate(['home',]);
  }


  viacAkoDvaja(organizacia){
    let tmp = [];
    this.mozemVytoritStretnutie = false;
    let userFunkcia = (JSON.parse(localStorage.getItem('user')).organizacie[organizacia].funkcia);
    if (userFunkcia == 'owner') {
      /* firebase.database().ref('organizacie/' + organizacia + '/clenovia')
        .on("child_added", (userData) => {
          firebase.database().ref('users/')
            .on("child_added", (Data) => {
              if (userData.key == Data.key) {
                tmp.push(Data.key);
              }
            });
        });*/
      for (let i = 0; i < this.pocetClenovOrg; i++) {
        tmp.push(i);
      }
    } else {
      /*firebase.database().ref('organizacie/' + organizacia + '/clenovia')
        .on("child_added", (userData) => {
          firebase.database().ref('users/')
            .on("child_added", (Data) => {
              if (userData.key == Data.key) {
                if(userData.val() == 'member') {
                  tmp.push(Data.key);
                }
              }
            });
        });*/
      for (let i = 0; i < this.pocetMemberov; i++) {
        tmp.push(i);
      }
    }
    if(tmp.length > 1 ){
      this.mozemVytoritStretnutie = true;
    }
  }

  pocetClenov(){
    this.pocetClenovOrg = 0;
    this.pocetMemberov = 0;
    let tmp = [];
      let orgID = JSON.parse(localStorage.getItem('org')).uid;
      firebase.database().ref('organizacie/' + orgID + '/clenovia' )
        .on('value', (clen) => {
          this.pocetClenovOrg = clen.numChildren();
          firebase.database().ref('organizacie/' + orgID + '/clenovia' )
            .on('child_added', (clenUdaje) => {
              firebase.database().ref('organizacie/' + orgID + '/clenovia/' + clenUdaje.key )
                .on('value', (clenHodnost) => {
                  if(clenHodnost.val() == 'member'){
                    this.pocetMemberov++;
                  }
                })
            })
          this.resolveStr();
        });
  }


}
