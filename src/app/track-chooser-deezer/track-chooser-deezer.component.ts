import { Component, Injectable, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { Track } from '../track';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { DeezerTrack } from '../deezer-track';

const APP_ID = '210662';
const PERMISSIONS = 'basic_access';
const REDIRECT_URI = 'http://tom.dancing/assets/deezer-auth.html';

interface IDeezerFile {
  title: string;
  deezerId: string;
}

@Injectable()
export class DeezerService {
  accessToken: string;

  constructor(private http: Http) {}

  rpc(method, args): Promise<any> {
    if (this.loadAccessToken())
      return Promise.reject('No access Token provided');

      return this.http
        .post('http://api.deezer.com/' + method,
             JSON.stringify(args),
             new RequestOptions({
               headers: new Headers({
                 'Content-Type': 'application/json',
                 'Authorization': 'Bearer ' + this.accessToken
               })
             }))
        .map(res => res.json())
        .toPromise()
        .catch(e => alert(e));
  }

  loadAccessToken() {
    if (this.accessToken)
      return this.accessToken;
    return this.accessToken = localStorage.getItem('deezer-token');
  }
  
  authenticated() {
    return !!this.loadAccessToken();
  }
}

@Component({
  selector: 'dnd-track-chooser-deezer',
  templateUrl: './track-chooser-deezer.component.html',
  styleUrls: ['./track-chooser-deezer.component.scss']
})
export class TrackChooserDeezerComponent implements OnInit {

  @Input() track: Track;
  @Output() created = new EventEmitter<Track>();
  constructor(private http: Http, private deezer: DeezerService) { }

  ngOnInit() {
  }

  authorize() {
    let w = window.open('https://connect.deezer.com/oauth/auth.php?app_id=' + APP_ID + '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) + '&response_type=token');
  
    let listener = (e) => {
      let accessToken = e.data.match(/access_token=([^&]+)/)[1];;
      localStorage.setItem('deezer-token', accessToken);
      window.removeEventListener('message', listener);
    };
    window.addEventListener('message', listener, false);
  }

}
