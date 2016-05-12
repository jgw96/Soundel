import {Injectable} from 'angular2/core';

declare module "soundcloud" {
  export let SC: any;
}
import * as SC from "soundcloud";


/*
  Generated class for the MusicService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MusicService {

  constructor() {

  }

  public init(): void {
    SC.initialize({
      client_id: "152f0d7acb02ac226e43133ece32b7ac"
    });
  }
  
  public getFirstTracks(): any {
    return SC.get("/tracks", {
      q: "Tame Impala",
      streamable: true,
      limit: 30
    })
  }
  
  public getTracks(term: string) {
    return SC.get("/tracks", {
      q: term
    });
  }

}

