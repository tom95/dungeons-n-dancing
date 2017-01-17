import { OnInit, HostListener, Component } from '@angular/core';

import { EmptyTrack } from '../empty-track';
import { PlaylistStorage } from '../playlist-storage';
import { Playlist } from '../playlist';
import { PlaybackManager } from '../playback-manager';
import { RandomPlayback, NormalPlayback } from '../playback';

@Component({
  selector: 'dnd-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  currentPlaylist: Playlist = null;

  constructor(private playback: PlaybackManager, private storage: PlaylistStorage) {
  }

  ngOnInit() {
    this.storage.load().then(p => this.currentPlaylist = this.storage.playlists[0]).catch(e => console.log('Loading playlists failed:', e));
  }

  toggleRandomPlayback(playlist) {
    playlist.playback = playlist.playback.playbackType === 'random' ?
      new NormalPlayback() : new RandomPlayback();
  }

  addPlaylist() {
    let name = prompt('Name of playlist?');
    if (!name) {
      return;
    }

    let playlist = new Playlist(name);
    this.storage.playlists.push(playlist);
    this.currentPlaylist = playlist;
  }

  replaceTrack(track, index) {
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
    this.storage.save();
  }

}
