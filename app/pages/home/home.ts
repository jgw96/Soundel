import {Page, Alert, NavController, Loading, Toast} from 'ionic-angular';
import {Keyboard} from 'ionic-native';
import {Toast as NativeToast} from "ionic-native";

import {HTTP_PROVIDERS} from '@angular/http';

/*declare module "soundcloud" {
  export default SC;
}
import * as SC from "soundcloud";*/
declare var SC: any;

import {MusicService} from "../../providers/music-service/music-service";
import {AuthProvider} from "../../providers/auth-provider/auth-provider";
import {Track} from "../../interfaces/track";
import {Player} from "../../interfaces/player";
import {ImagePipe} from "../../pipes/ImagePipe";


@Page({
  templateUrl: 'build/pages/home/home.html',
  providers: [MusicService, AuthProvider, HTTP_PROVIDERS],
  pipes: [ImagePipe]
})
export class HomePage {

  public songs: Track[];
  public mainPlayer: Player;
  private loading: Loading;
  private toast: Toast;
  public loggedIn: boolean;
  public avatar: string
  private toastOpen: boolean;

  constructor(private nav: NavController, private musicService: MusicService, private authService: AuthProvider) { }
  
  private onPageDidEnter(): void {
    if(this.authService.getToken() !== null) {
      this.loggedIn = true;
      this.avatar = this.authService.getAvatar();
    }
  }

  private onPageLoaded(): void {

    this.musicService.init();

    this.loggedIn = false;

    let loading = Loading.create({
      content: "Getting songs..."
    });

    this.nav.present(loading).then(() => {
      this.musicService.getFirstTracks().then((tracks) => {
        console.log(tracks);
        this.songs = tracks;
        loading.dismiss();
      })
    });

    this.toastOpen = false;

  }

  public search(): void {

    let prompt = Alert.create({
      title: 'Search',
      message: "Enter a genre, artist or anything!",
      inputs: [
        {
          name: 'term',
          placeholder: 'Tame Impala'
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
          text: 'search',
          handler: data => {
            console.log('Saved clicked');

            let loading = Loading.create({
              content: "Getting songs..."
            });

            this.nav.present(loading).then(() => {
              this.musicService.getTracks(data.term).then((tracks) => {
                this.songs = tracks;
                loading.dismiss();
              });
            });

          }
        }
      ]
    });

    this.nav.present(prompt);
  }

  public play(id: string, songName: string, duration: number): void {
    if (this.toast !== undefined && this.toast._destroys.length === 1) {
      this.toast.setMessage(`Currently playing ${songName}`)

      SC.stream(`/tracks/${id}`).then((player) => {
        player.play();
        this.mainPlayer = player;

        this.toast.onDismiss(() => {
          this.toastOpen = false;
          this.pause();
        })

        //set up events
        player.on("finish", () => {
          this.toast.dismiss().then(() => {
            //hacky workaround
            this.toast.dismiss();
            this.toastOpen = false;

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

        this.nav.present(this.toast).then(() => {
          this.toastOpen = true;
        });

        this.toast.onDismiss(() => {
          this.toastOpen = false;
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

  public login(): void {
    this.authService.login().then((result) => {
      console.log(result);
      this.loggedIn = true;
      this.avatar = result;

      let toast = Toast.create({
        message: "Succesfully logged in",
        duration: 3000
      });
      this.nav.present(toast);
    }).catch((err) => {
      let alert = Alert.create({
        title: "Not logged in",
        message: "You were not logged in.",
        buttons: ["OK"]
      })
      this.nav.present(alert);
    })
  }

  public like(id: string): void {
    this.authService.likeTrack(id)
      .subscribe(
      data => {
        console.log(data)

        if (this.toastOpen === false) {
          NativeToast.showShortBottom("Song Liked")
            .subscribe(
            done => console.log("done"),
            error => console.log(error)
            )
        }
        else {
          NativeToast.showShortCenter("Song Liked")
          .subscribe(
            done => console.log("done"),
            error => console.log(error)
          )
        }

      },
      error => alert(error)
      )
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
