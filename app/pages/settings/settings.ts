import {Component} from "@angular/core";
import {NavController, AlertController} from 'ionic-angular';
import {Toast} from "ionic-native";
import {Insomnia} from "ionic-native";
import {AppRate} from 'ionic-native';

import * as localforage from "localforage";

/*
  Generated class for the SettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/settings/settings.html',
})
export class SettingsPage {

  public defaultSearch: string;
  screenStatus: boolean;

  ionViewDidEnter(): void {
    localforage.getItem("defaultSearch").then((value) => {
      console.log(value);
      if (value === null) {
        this.defaultSearch = "Tame Impala";
      }
      else {
        this.defaultSearch = value.toString();
      }
    })
  }

  constructor(public nav: NavController, private alertCtrl: AlertController) {
    this.screenStatus = false;
  }

  private changeDefaultSearch(): void {
    let prompt = this.alertCtrl.create({
      title: 'Default Search',
      message: "This sets the default search for the first batch of songs that is shown.",
      inputs: [
        {
          name: "term",
          placeholder: 'Search Term'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            localforage.setItem("defaultSearch", data.term).then((value) => {
              this.defaultSearch = value;
            }).catch((err) => {
              console.log(err);
            })
          }
        }
      ]
    });
    prompt.present();

  }

  private screenAwake(): void {
    console.log(this.screenStatus);
    if (this.screenStatus === true) {
      Insomnia.keepAwake().then(() => {
        console.log("success");
        Toast.showShortBottom("Screen will stay awake")
          .subscribe(
          done => console.log("Done"),
          error => console.log(error)
          )
      })
    }
    else {
      Insomnia.allowSleepAgain().then(() => {
        Toast.showShortBottom("Screen settings normal now")
          .subscribe(
          done => console.log("Done"),
          error => console.log(error)
          )
      })
    }
  }

  private rateApp(): void {
    AppRate.preferences.storeAppURL.android = 'market://details?id=com.ionicframework.soundel680751';
    AppRate.promptForRating(true);
  }

}
