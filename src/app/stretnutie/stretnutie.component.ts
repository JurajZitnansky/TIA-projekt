import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import {Router} from "@angular/router";


@Component({
  selector: 'app-stretnutie',
  templateUrl: './stretnutie.component.html',
  styleUrls: ['./stretnutie.component.css']
})
export class StretnutieComponent implements OnInit {

  constructor(private router : Router) { }

  ngOnInit() {
  }

  back() {
    this.router.navigate(['home',]);
  }

}
