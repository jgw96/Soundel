import {Component} from '@angular/core';
import {NavController, ViewController} from 'ionic-angular';

import {AuthProvider} from "../../providers/auth-provider/auth-provider";

/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/login/login.html',
  providers: [AuthProvider]
})
export class LoginPage {
  constructor(public nav: NavController, private viewCtrl: ViewController, private authService: AuthProvider) {}
  
  private login(): void {
    this.authService.login().then((result) => {
      console.log(result);
      
      sessionStorage.setItem("loginAvatar", result);
      this.viewCtrl.dismiss();
    }).catch((error) => {
      this.viewCtrl.dismiss();
    })
  }
  
}
