import {Page, Alert, NavController, Loading, Toast} from 'ionic-angular';

declare var SC: any;

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {

  public songs: any[];
  public mainPlayer: any;
  private loading: any;
  private toast: Toast;

  constructor(private nav: NavController) { }

  private onPageLoaded(): void {
    SC.initialize({
      client_id: "152f0d7acb02ac226e43133ece32b7ac"
    })
    
    console.log("loaded");
    
    let loading = Loading.create({
      content: "Getting songs..."
    });
    
    this.nav.present(loading).then(() => {
      SC.get("/tracks", {
        q: "Tame Impala"
      }).then((tracks) => {
        this.songs = tracks;
        loading.dismiss();
      });
    });

  }

  public search(term: string): void {
    let loading = Loading.create({
      content: "Getting songs..."
    });

    this.nav.present(loading).then(() => {
      SC.get('/tracks', {
        q: term
      }).then((tracks) => {
        console.log(tracks);
        this.songs = tracks;
        loading.dismiss();
      });
    })
  }

  public play(id: string, songName: string, songDuration: number): void {
    SC.stream(`/tracks/${id}`).then((player) => {
      player.play();
      this.mainPlayer = player;

      this.toast = Toast.create({
        message: `Currently playing ${songName}`,
        enableBackdropDismiss: false,
        showCloseButton: true,
        closeButtonText: "stop"
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
      player.on("buffering_start", () => {
        this.loading = Loading.create({
          content: "Buffering..."
        })
        this.nav.present(this.loading);
      });
      player.on("buffering_end", () => {
        setTimeout(() => {
          this.loading.dismiss();
        }, 700);
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
            const randNum = Math.floor((Math.random() * 9) + 0);
            console.log(randNum);

            this.play(this.songs[randNum].id, this.songs[randNum].title, this.songs[randNum].duration);
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
