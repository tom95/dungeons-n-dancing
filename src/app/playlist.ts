import { Track } from './track';
import { Playback, NormalPlayback } from './playback';
import { genId } from './utils';

export class Playlist {
  id: string;
  items: Array<Track> = [];
  playback: Playback;
  playlistTitle: string;
  backgroundUrl: string;

  constructor(title) {
    this.playlistTitle = title;
    this.playback = new NormalPlayback();
    this.id = genId('playlist');
  }

  backgroundImageStyle() {
    return this.backgroundUrl ? 'url(' + this.backgroundUrl + ')' : '';
  }

  add(track: Track) {
    this.items.push(track);
  }

  title(): string {
    return this.playlistTitle;
  }

  findStartTrack(): Track {
    return this.playback.findStartTrack(this.items);
  }

  nextTrack(previous: Track): Track {
    return this.playback.nextTrack(this.items, previous);
  }

  serialize(): Promise<any> {
    return Promise.all(this.items.map(track => track.serialize())).then(tracks => ({
      title: this.playlistTitle,
      backgroundUrl: this.backgroundUrl,
      tracks: tracks,
      type: 'playlist',
      id: this.id
    })).then(playlist => this.playback.serialize(playlist));
  }
}
