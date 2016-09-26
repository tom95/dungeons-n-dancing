import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Track } from '../track';

const CLIENT_ID = 'zo46egxljs3qhm8';
const REDIRECT_URI = 'http://localhost:4200/assets/dropbox-auth.html';

@Component({
  selector: 'dnd-track-chooser-dropbox',
  templateUrl: './track-chooser-dropbox.component.html',
  styleUrls: ['./track-chooser-dropbox.component.scss']
})
export class TrackChooserDropboxComponent implements OnInit {

  @Input() track: Track;
  @Output() created = new EventEmitter<Track>();

  accessToken: string;

  constructor(private http: Http) { }

  ngOnInit() {
    this.accessToken = localStorage.getItem('dropbox-token');

    if (this.accessToken)
      this.loadFiles().then(console.log);
  }

  loadFiles() {
    let list = [];

    return new Promise((resolve, reject) => {
      let receiveFiles = (data) => {
        list = list.concat(data.entries);
        if (data.has_more)
          this.rpc('files/list_folder/continue', { cursor: data.cursor }).then(receiveFiles).catch(reject);
        else
          resolve(list);
      };

      this.rpc('files/list_folder', { recursive: true, path: '' }).then(receiveFiles).catch(reject);
    });
  }

  rpc(method, args) {
    return this.http
      .post('https://api.dropboxapi.com/2/' + method,
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

  authorize() {
    let w = window.open('https://www.dropbox.com/1/oauth2/authorize?client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URI + '&response_type=token');

    let listener = (e) => {
      this.accessToken = e.data.match(/access_token=([^&]+)/)[1];
      localStorage.setItem('dropbox-token', this.accessToken);
      window.removeEventListener('message', listener);
    };
    window.addEventListener('message', listener, false);
  }

}
