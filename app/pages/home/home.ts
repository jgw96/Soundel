import {Page, Alert, NavController, Loading, Toast, Platform} from 'ionic-angular';
import {Keyboard} from 'ionic-native';
import {Toast as NativeToast} from "ionic-native";
import {SocialSharing} from 'ionic-native';

import {HTTP_PROVIDERS} from '@angular/http';

import * as localforage from "localforage";

declare var SC: any;
declare var shake: any;
declare var Howl: any;

import {MusicService} from "../../providers/music-service/music-service";
import {Track} from "../../interfaces/track";
import {Player} from "../../interfaces/player";
import {ImagePipe} from "../../pipes/ImagePipe";


@Page({
  templateUrl: 'build/pages/home/home.html',
  providers: [MusicService, HTTP_PROVIDERS],
  pipes: [ImagePipe]
})
export class HomePage {

  public songs: Track[];
  public secondSongs: Track[];
  public mainPlayer: Player;
  private loading: Loading;
  private toast: Toast;
  public loggedIn: boolean;
  public avatar: string
  private toastOpen: boolean;
  public isMD: boolean;
  private localSound: any;

  constructor(private nav: NavController, private musicService: MusicService, private platform: Platform) {
  }


  private onPageLoaded(): void {

    if (this.platform.is("android") || this.platform.is("core")) {
      this.isMD = true;
    }
    else {
      this.isMD = false;
    }

    this.musicService.init();

    this.loggedIn = false;

    let loading = Loading.create({
      content: "Getting songs..."
    });

    this.nav.present(loading).then(() => {
      localforage.getItem("defaultSearch").then((value) => {
        if (value === null) {
          this.musicService.getFirstTracks("Tame Impala").then((tracks) => {
            console.log(tracks);

            let half = Math.ceil(tracks.length / 2);
            let leftSide = tracks.splice(0, half);

            this.songs = leftSide;
            this.secondSongs = tracks;

            console.log(this.songs);
            console.log(this.secondSongs);

            loading.dismiss();
          })
        }
        else {
          this.musicService.getFirstTracks(value).then((tracks) => {
            console.log(tracks);
            let half = Math.ceil(tracks.length / 2);
            let leftSide = tracks.splice(0, half);

            this.songs = leftSide;
            this.secondSongs = tracks;

            console.log(this.songs);
            console.log(this.secondSongs);
            loading.dismiss();
          })
        }
      })
    });

    this.toastOpen = false;
    
    this.playLocalMusic();
  }

  public playLocalMusic(): void {
    const body = <HTMLBodyElement>document.querySelector("body");

    //dirty hack i have to do
    window.ondragover = (e) => {
      e.preventDefault(); return false
    };
    window.ondrop = (e): any => {
      e.preventDefault();
      return false;
    };

    body.ondrop = (e) => {
      e.preventDefault();
      let file = e.dataTransfer.files[0];
      console.log(file);

      this.localSound = new Howl({
        urls: [file.path]
      }).play();

      if (this.toast !== undefined && this.toast._destroys.length === 1) {
        this.toast.setMessage(`Playing ${file.name}`);

        this.toast.onDismiss(() => {
          this.localSound.unload();
        })
      }
      else {
        this.toast = Toast.create({
          message: `Playing ${file.name}`,
          enableBackdropDismiss: false,
          showCloseButton: true,
          closeButtonText: "stop",
          dismissOnPageChange: false
        });
        this.nav.present(this.toast);

        this.toast.onDismiss(() => {
          this.localSound.unload();
        })
      }

      return false;
    }
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
                let half = Math.ceil(tracks.length / 2);
                let leftSide = tracks.splice(0, half);

                this.songs = leftSide;
                this.secondSongs = tracks;

                console.log(this.songs);
                console.log(this.secondSongs);
                loading.dismiss();
              });
            });

          }
        }
      ]
    });

    this.nav.present(prompt);
  }

  private load(id: string, songName: string, duration: number): Promise<any> {

    if (this.toast !== undefined && this.toast._destroys.length === 1) {
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

          this.toast = Toast.create({
            message: `Playing ${songName}`,
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
      });
    }

  }

  public play(id: string, songName: string, duration: number): void {
    let loading = Loading.create({
      content: "Buffering..."
    });
    this.nav.present(loading).then(() => {

      if (this.localSound) {
        this.localSound.unload();
      }

      this.load(id, songName, duration).then((song) => {
        song.play();
        setTimeout(() => {
          loading.dismiss();
        }, 700)
      })

    })
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

  public share(songUrl: string) {
    //SocialSharing.share("Check out what im listening too!", null, null, songUrl);
    window.open(`https://twitter.com/share?url=${songUrl}&text=Check out what im listening too!`)
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
