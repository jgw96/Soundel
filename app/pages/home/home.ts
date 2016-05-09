import {Page} from 'ionic-angular';

declare var SC: any;

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  
  public songs: any[];
  public playing: boolean;
  public currentlyPlaying: string;
  public mainPlayer: any;

  constructor() {}

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
    })  
    this.playing = true;
    this.currentlyPlaying = songName;
  }
  
  public pause(): void {
    this.mainPlayer.pause();
  }

}
