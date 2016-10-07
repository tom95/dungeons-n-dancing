import { Injectable } from '@angular/core';
import { Playlist } from './playlist';

import { RandomPlayback, NormalPlayback } from './playback';
import { Track } from './track';
import { EmptyTrack } from './empty-track';
import { LocalTrack } from './local-track';
import { YoutubeTrack } from './youtube-track';
import { DropboxTrack } from './dropbox-track';
import { DeezerTrack } from './deezer-track';

@Injectable()
export class PlaylistStorage {
  playlists: Playlist[];

  load() {
    let data = localStorage.getItem('playlists');
    this.playlists = [];
    if (!data)
      return Promise.resolve([]);

    let p: Promise<Playlist>[] = JSON.parse(data).map(playlist => this.deserializePlaylist(playlist));

    return Promise.all(p).then(playlists => {
      this.playlists = playlists;
      return playlists;
    });
  }

  findPlaylistById(id: string): Playlist {
    return this.playlists.find(p => p.id == id);
  }

  findTrackById(id: string): Track {
    for (let i = 0; i < this.playlists.length; i++) {
      let track = this.playlists[i].items.find(t => t.id == id);
      if (track)
        return track;
    }
    return null;
  }

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

  deserializePlaylist(data: any): Promise<Playlist> {
    let p: Promise<Track>[] = data.tracks.filter(t => t).map(track => {
      switch (track.type) {
        case 'track-youtube':
          return YoutubeTrack.deserialize(track);
        case 'track-local':
          return LocalTrack.deserialize(track);
        case 'track-dropbox':
          return DropboxTrack.deserialize(track);
        case 'track-deezer':
          return DeezerTrack.deserialize(track);
        default:
          return EmptyTrack.deserialize(track);
      }
    });

    return Promise.all(p).then(tracks => {
      let playlist = new Playlist(data.title);
      switch (data.playback) {
        case 'random':
          playlist.playback = new RandomPlayback();
        break;
        default:
          playlist.playback = new NormalPlayback();
        break;
      }

      playlist.backgroundUrl = data.backgroundUrl;
      playlist.items = tracks;
      return playlist;
    });
  }

}

