import {Component} from "@angular/core";
import {HTTP_PROVIDERS} from '@angular/http';
import {NavController, ToastController, Platform, PopoverController, AlertController, LoadingController, ActionSheetController} from 'ionic-angular';
import {Keyboard, Toast as NativeToast, SocialSharing} from 'ionic-native';

import * as localforage from "localforage";
import {MusicService} from "../../providers/music-service/music-service";
import {AuthProvider} from "../../providers/auth-provider/auth-provider";
import {Track} from "../../interfaces/track";
import {Player} from "../../interfaces/player";
import {ImagePipe} from "../../pipes/ImagePipe";
import {LoginPage} from "../../pages/login/login";

declare var SC: any;
declare var shake: any;


@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [MusicService, AuthProvider, HTTP_PROVIDERS],
  pipes: [ImagePipe]
})
export class HomePage {

  public songs: Track[];
  public mainPlayer: Player;
  private loading: LoadingController;
  private toast: any;
  public loggedIn: boolean;
  public avatar: string
  private toastOpen: boolean;

  constructor(
    private nav: NavController,
    private musicService: MusicService,
    private authService: AuthProvider,
    private platform: Platform,
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    private actionCtrl: ActionSheetController,
    private popCtrl: PopoverController,
    private toastCtrl: ToastController
  ) {
  }

  private ionViewDidEnter(): void {
    if (this.authService.getToken() !== null) {
      this.loggedIn = true;
      this.avatar = this.authService.getAvatar();
    }
  }

  private ionViewLoaded(): void {

    setTimeout(() => {
      this.musicService.init();

      this.loggedIn = false;

      let loading = this.loadCtrl.create({
        content: "Getting songs..."
      });

      loading.present().then(() => {
        localforage.getItem("defaultSearch").then((value) => {
          if (value === null) {
            this.musicService.getFirstTracks("Tame Impala").then((tracks) => {
              this.songs = tracks;
              loading.dismiss();
            })
          }
          else {
            this.musicService.getFirstTracks(value).then((tracks) => {
              this.songs = tracks;
              loading.dismiss();
            })
          }
        })
      });

      this.toastOpen = false;

      shake.startWatch(() => {
        const maxMatches = 1;
        const promptString = "What would you like to listen too";
        window.plugins.speechrecognizer.startRecognize((data) => {
          this.musicService.getTracks(data[0]).then((tracks) => {
            this.songs = tracks;
          })
        }, (error) => {
          console.log(error);
        }, maxMatches, promptString);
      })
    }, 500)

  }

  private search(): void {

    let prompt = this.alertCtrl.create({
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

            let loading = this.loadCtrl.create({
              content: "Getting songs..."
            });

            loading.present().then(() => {
              this.musicService.getTracks(data.term).then((tracks) => {
                this.songs = tracks;
                loading.dismiss();
              });
            });

          }
        }
      ]
    });

    prompt.present();
  }

  private options(songUrl: string, userUrl: string): void {

    let actions = this.actionCtrl.create({
      title: "Actions",
      buttons: [
        {
          text: "Visit on SoundCloud",
          icon: "link",
          handler: () => {
            window.open(songUrl);
          }
        },
        {
          text: "See who posted",
          icon: "person",
          handler: () => {
            window.open(userUrl);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: "close",
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actions.present();
  }

  private load(id: string, songName: string, duration: number): Promise<any> {

    if (this.toast !== undefined && this.toastOpen === true) {
      console.log("toast is already here")
      return new Promise((resolve, reject) => {
        this.toast.setMessage(`Playing ${songName}`)

        SC.stream(`/tracks/${id}`).then((player) => {
          //player.play();
          resolve(this.mainPlayer = player);

          this.toast.onDismiss(() => {
            this.toastOpen = false;
            this.pause();
          })

          //set up events
          player.on("finish", () => {
            this.toast.dismiss().then(() => {

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
      })

    }
    else {
      return new Promise((resolve, reject) => {
        SC.stream(`/tracks/${id}`, {
          useHTML5Audio: true,
          preferFlash: false
        }).then((player) => {
          console.log(player);
          //player.play();
          resolve(this.mainPlayer = player);

          this.toast = this.toastCtrl.create({
            message: `Playing ${songName}`,
            showCloseButton: true,
            closeButtonText: "stop",
            dismissOnPageChange: false
          });

          this.toast.present(this.toast).then(() => {
            this.toastOpen = true;
          });

          this.toast.onDismiss(() => {
            this.toastOpen = false;
            this.pause();
            console.log(this.toast);
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
      });
    }

  }

  private play(id: string, songName: string, duration: number): void {
    let loading = this.loadCtrl.create({
      content: "Buffering..."
    });
    loading.present().then(() => {
      this.load(id, songName, duration).then((song) => {
        song.play();
        setTimeout(() => {
          loading.dismiss();
        }, 700)
      })

    })
  }

  private pause(): void {
    this.mainPlayer.pause();
  }

  private songDone(): void {
    const randNum: number = Math.floor(Math.random() * 9) + 0;
    console.log(randNum);

    this.play(
      this.songs[randNum].id,
      this.songs[randNum].title,
      this.songs[randNum].duration
    )
  }

  private login(myEvent: Event): void {
    let popover = this.popCtrl.create(LoginPage);
    popover.present({
      ev: myEvent
    });

    popover.onDidDismiss(() => {
      if (sessionStorage.getItem("loginAvatar") !== null) {
        this.loggedIn = true;
        this.avatar = sessionStorage.getItem("loginAvatar");

        NativeToast.showShortBottom("Logged In")
          .subscribe(
          done => console.log("Done"),
          error => console.log(error)
          )
      }
      else {
        NativeToast.showShortBottom("Not logged in")
          .subscribe(
          done => console.log("done"),
          error => console.log(error)
          )
      }
    })

  }

  private like(id: string): void {
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

  private share(songUrl: string): void {
    SocialSharing.share("Check out what im listening too!", null, null, songUrl);
  }

  private audioError(): void {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: 'There was an error getting this song',
      buttons: ['OK']
    });
    alert.present();
  }

}

