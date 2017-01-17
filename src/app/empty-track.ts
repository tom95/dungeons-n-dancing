import { Track } from './track';

export class EmptyTrack extends Track {
  static deserialize(track) {
    let t = new EmptyTrack();
    t.id = track.id;
    return Promise.resolve(t);
  }

  serialize() {
    return Promise.resolve({
      id: this.id,
      type: 'track-empty'
    });
  }
}
