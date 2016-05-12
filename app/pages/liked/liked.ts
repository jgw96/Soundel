import {Page, NavController, Toast, Alert, Loading} from 'ionic-angular';
import {HTTP_PROVIDERS} from "angular2/http";

import {AuthProvider} from "../../providers/auth-provider/auth-provider";
import {Track} from "../../interfaces/track";
import {ImagePipe} from "../../pipes/ImagePipe";
import {Player} from "../../interfaces/player";

declare module "soundcloud" {
  export default SC;
}
import * as SC from "soundcloud";

/*
  Generated class for the LikedPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/liked/liked.html',
  providers: [AuthProvider, HTTP_PROVIDERS],
  pipes: [ImagePipe]
})
export class LikedPage {

  public songs: Track[];
  public mainPlayer: Player;
  private loading: Loading;
  private toast: Toast;

  onPageDidEnter() {
    let loading = Loading.create({
      content: "Getting songs..."
    });

    this.nav.present(loading).then(() => {
      this.authProvider.getLiked()
        .subscribe(
        data => {
          this.songs = data;
          loading.dismiss();
        },
        error => alert(error)
        )
    });

  }
  constructor(private nav: NavController, private authProvider: AuthProvider) { }

  public play(id: string, songName: string, duration: number): void {
    if (this.toast !== undefined && this.toast._destroys.length === 1) {
      this.toast.setMessage(`Currently playing ${songName}`)

      SC.stream(`/tracks/${id}`).then((player) => {
        player.play();
        this.mainPlayer = player;

        this.toast.onDismiss(() => {
          this.pause();
        })

        //set up events
        player.on("finish", () => {
          this.toast.dismiss().then(() => {
            //hacky workaround
            this.toast.dismiss();

            this.songDone();
          })
        });

        player.on("audio_error", () => {
          this.audioError();
        });
        player.on("no_connection", () => {
          this.audioError();
        });
        player.on("no_streams", () => {
          this.audioError();
        });
      });
    }
    else {
      SC.stream(`/tracks/${id}`).then((player) => {
        player.play();
        this.mainPlayer = player;

        this.toast = Toast.create({
          message: `Currently playing ${songName}`,
          enableBackdropDismiss: false,
          showCloseButton: true,
          closeButtonText: "stop",
          dismissOnPageChange: false
        });

        this.nav.present(this.toast);

        this.toast.onDismiss(() => {
          this.pause();
        })

        //set up events
        player.on("finish", () => {
          this.toast.dismiss().then(() => {
            //hacky workaround
            this.toast.dismiss();

            this.songDone();
          })
        });

        player.on("audio_error", () => {
          this.audioError();
        });
        player.on("no_connection", () => {
          this.audioError();
        });
        player.on("no_streams", () => {
          this.audioError();
        });
      });
    }
  }

  public pause(): void {
    this.mainPlayer.pause();
  }

  private songDone(): void {
    let confirm = Alert.create({
      title: 'Song finished',
      message: 'Would you like to play a similar song?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log(this.songs);
            const randNum: number = Math.floor((Math.random() * 9) + 0);
            console.log(randNum);

            this.play(
              this.songs[randNum].id,
              this.songs[randNum].title,
              this.songs[randNum].duration
            );

          }
        }
      ]
    });

    this.nav.present(confirm);
  }

  private audioError(): void {
    let alert = Alert.create({
      title: 'Error',
      subTitle: 'There was an error getting this song',
      buttons: ['OK']
    });
    this.nav.present(alert);
  }
}
