import { Component, Injectable, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Track } from '../track';
import { DropboxTrack } from '../dropbox-track';

const CLIENT_ID = 'zo46egxljs3qhm8';
const REDIRECT_URI = 'http://localhost:4200/assets/dropbox-auth.html';

interface IDropboxFile {
  title: string;
  dropboxId: string;
  path: string;
  isAudioFile: boolean;
  isFolder: boolean;
  url: string;
  children: Array<IDropboxFile>;
}

@Injectable()
export class DropboxService {
  accessToken: string;

  constructor(private http: Http) {}

  rpc(method, args): Promise<any> {
    if (!this.loadAccessToken)
      return Promise.reject('No access token provided');

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

  loadAccessToken() {
    if (this.accessToken)
      return this.accessToken;
    return this.accessToken = localStorage.getItem('dropbox-token');
  }

  authenticated() {
    return !!this.loadAccessToken();
  }

  createSharedLinkWithSettings(path: string): Promise<string> {
    return this.rpc('sharing/create_shared_link_with_settings', { path: path }).then(data => data.url);
  }

  listSharedLinks(path: string) {
    return this.rpc('sharing/list_shared_links', { path: path, direct_only: true }).then(data => data.links);
  }

  listFolder(path: string): Promise<IDropboxFile[]> {
    let list: IDropboxFile[] = [];

    return new Promise((resolve, reject) => {
      let receiveFiles = data => {
        list = list.concat(data.entries.map(file => ({
          title: file.name,
          path: file.path_lower,
          url: file.url,
          dropboxId: file.id,
          isFolder: file['.tag'] == 'folder',
          isAudioFile: false /*TODO*/,
          children: null
        })));
        if (data.has_more)
          this.rpc('files/list_folder/continue', { cursor: data.cursor }).then(receiveFiles).catch(reject);
        else
          resolve(list);
      };

      this.rpc('files/list_folder', { path: path }).then(receiveFiles).catch(reject);
    });
  }
}

@Component({
  selector: 'dropbox-file',
  template: ` <a href="#" (click)="select()" [textContent]="file.title"></a>
  <ul *ngIf="file.isFolder && file.children" [style.height]="expanded ? 'auto' : 0">
    <li *ngFor="let cfile of file.children">
      <dropbox-file [file]="cfile" (selected)="selected.emit($event)"></dropbox-file>
    </li>
  <ul>`
})
export class DropboxFile implements OnInit {
  @Input() file: IDropboxFile;
  @Output() selected = new EventEmitter<IDropboxFile>();

  expanded: boolean = false;

  constructor(private dropbox: DropboxService) {}

  ngOnInit() {}

  select() {
    if (this.file.isFolder) {
      if (this.file.children === null)
        this.dropbox.listFolder(this.file.path).then(files => this.file.children = files);
      this.expanded = !this.expanded;
    } else
      this.selected.emit(this.file);
  }
}

@Component({
  selector: 'dnd-track-chooser-dropbox',
  templateUrl: './track-chooser-dropbox.component.html',
  styleUrls: ['./track-chooser-dropbox.component.scss']
})
export class TrackChooserDropboxComponent implements OnInit {

  @Input() track: Track;
  @Output() created = new EventEmitter<Track>();

  files: Array<IDropboxFile>;

  constructor(private http: Http, private dropbox: DropboxService) { }

  ngOnInit() {
    if (this.dropbox.authenticated())
      this.dropbox.listFolder('').then(files => this.files = files);
  }

  authorize() {
    let w = window.open('https://www.dropbox.com/1/oauth2/authorize?client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URI + '&response_type=token');

    let listener = (e) => {
      let accessToken = e.data.match(/access_token=([^&]+)/)[1];
      localStorage.setItem('dropbox-token', accessToken);
      window.removeEventListener('message', listener);
    };
    window.addEventListener('message', listener, false);
  }

  fileSelected(file: IDropboxFile) {
    this.dropbox.listSharedLinks(file.dropboxId)
      .then(links => {
        if (links.length > 0)
          return links[0].url;
        else
          return this.dropbox.createSharedLinkWithSettings(file.dropboxId);
      })
      .then(url => url.replace('dl=0', 'raw=1'))
      .then(url => this.created.emit(new DropboxTrack(file.title, url)));
  }

}
