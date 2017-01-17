import { Track } from './track';

export interface Playback {
  playbackType: string;
  findStartTrack(tracks: Track[]): Track;
  nextTrack(tracks: Track[], previous: Track): Track;
  serialize(playlist: any): Promise<any>;
}

export class NormalPlayback implements Playback {
  playbackType = 'normal';

  findStartTrack(tracks: Track[]): Track {
    return tracks[0];
  }

  nextTrack(tracks: Track[], previous: Track): Track {
    let index = tracks.indexOf(previous);
    let nextIndex = index + 1 >= tracks.length ? 0 : index + 1;
    return tracks[nextIndex];
  }

  serialize(playlist: any): Promise<any> {
    playlist.playback = 'normal';
    return Promise.resolve(playlist);
  }
}

export class RandomPlayback implements Playback {
  playbackType = 'random';

  findStartTrack(tracks: Track[]): Track {
    return tracks[this.getRandomIndex(tracks.length)];
  }

  nextTrack(tracks: Track[], previous: Track): Track {
    let index = tracks.indexOf(previous);
    let randomIndex = this.getRandomIndex(tracks.length);
    let nextIndex = randomIndex !== index ? randomIndex : randomIndex + 1;
    if (nextIndex >= tracks.length) {
      nextIndex = 0;
    }
    return tracks[nextIndex];
  }

  getRandomIndex(len: number)  {
    return Math.floor(Math.random() * len);
  }

  serialize(playlist: any): Promise<any> {
    playlist.playback = 'random';
    return Promise.resolve(playlist);
  }

}
