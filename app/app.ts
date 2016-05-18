import 'reflect-metadata';
import 'zone.js/dist/zone';

import {App, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
//import {HomePage} from './pages/home/home';
import {TabsPage} from "./pages/tabs/tabs";

import 'rxjs/Rx';


@App({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  config: {
    
  } // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      console.log("ready");
    });
  }
}
