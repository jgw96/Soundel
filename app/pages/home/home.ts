import {Page, Alert, NavController, Loading} from 'ionic-angular';

declare var SC: any;

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {

  public songs: any[];
  public playing: boolean;
  public currentlyPlaying: string;
  public mainPlayer: any;
  private loading: any;

  constructor(private nav: NavController) { }

  private onPageLoaded(): void {
    SC.initialize({
      client_id: "152f0d7acb02ac226e43133ece32b7ac"
    })

    this.playing = false;
  }

  public search(term: string): void {
    SC.get('/tracks', {
      q: term
    }).then((tracks) => {
      console.log(tracks);
      this.songs = tracks;
    });
  }

  public play(id: string, songName: string): void {
    SC.stream(`/tracks/${id}`).then((player) => {
      player.play();
      this.mainPlayer = player;

      //set up events
      player.on("finish", () => {
        this.songDone();
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
      })
      player.on("no_streams", () => {
        this.audioError();
      })

    })
    this.playing = true;
    this.currentlyPlaying = songName;
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

            this.play(this.songs[randNum].id, this.songs[randNum].title);
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
