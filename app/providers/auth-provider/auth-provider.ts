import {Injectable} from '@angular/core';
import {Http, Response} from "@angular/http";
import {Observable} from 'rxjs/Observable';

declare var OAuth: any;

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AuthProvider {

  public avatar: string;

  constructor(private http: Http) { }

  public login(): Promise<any> {
    return new Promise((resolve, reject) => {
      OAuth.initialize("ouGtbUPg__glcUhCrjv4nsZ0W_4");

      OAuth.popup("soundcloud")
        .done((result) => {
          console.log(result);
          sessionStorage.setItem("claudioToken", result.access_token);
          result.me()
            .done((response) => {
              sessionStorage.setItem("soundelAvatar", response.avatar);
              this.avatar = response.avatar;
              resolve(this.avatar);
            })
        })
        .fail((err) => {
          console.log(err);
          reject(err);
        })
    });
  }
  
  public getAvatar(): string {
    return sessionStorage.getItem("soundelAvatar");
  }

  public getToken(): string {
    const token = sessionStorage.getItem("claudioToken");
    return token;
  }

  public likeTrack(id: string): Observable<any> {
    let token = this.getToken();
    let body = JSON.stringify({})

    return this.http.put(`https://api.soundcloud.com/me/favorites/${id}?oauth_token=${token}`, body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  public getLiked(): Observable<any> {
    console.log(this.getToken());
    let token = this.getToken();

    return this.http.get(`https://api.soundcloud.com/me/favorites?oauth_token=${token}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response): Object {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }
    let body = res.json();
    return body || {};
  }

  private handleError(error: any): any {
    // In a real world app, we might send the error to remote logging infrastructure
    let errMsg = error.message || 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

}

