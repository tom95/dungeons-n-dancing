import { ElementRef, HostListener, Component } from '@angular/core';
import { Track } from './track';
import { EmptyTrack } from './empty-track';
import { Playlist } from './playlist';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  playlists: Array<Playlist> = [];
  currentPlaylist: Playlist = null;

  constructor() {
  }

  ngOnInit() {
    this.load();
  }

  addPlaylist() {
    let name = prompt('Name of playlist?')
    if (!name)
      return;

    let playlist = new Playlist(name);
    this.playlists.push(playlist);
    this.currentPlaylist = playlist;
  }

  replaceTrack(track, index) {
    console.log(track, index);
    this.currentPlaylist.items[index] = track;
  }

  deleteTrack(track, index) {
    this.currentPlaylist.items.splice(index, 1);
  }

  addTrack() {
    this.currentPlaylist.items.push(new EmptyTrack());
  }

  @HostListener('window:beforeunload')
  save() {
    // FIXME this is here to make sure on error not all data is deleted,
    // but it also means that we can't delete al playlists
    if (!this.playlists || !this.playlists.length)
      return;

    Promise.all(this.playlists.map((playlist) => {
      return playlist.serialize();
    })).then((playlists) => {
      localStorage.setItem('playlists', JSON.stringify(playlists));
    });
  }

  load() {
    let data = localStorage.getItem('playlists');
    if (!data)
      return Promise.resolve(false);

    let p: Promise<Playlist>[] = JSON.parse(data).map(playlist => Playlist.deserialize(playlist));

    return Promise.all(p).then(playlists => {
      this.playlists = playlists;
      this.currentPlaylist = playlists[0];
      return true;
    });
  }
}
