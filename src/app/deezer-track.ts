import { Track } from './track';

export class DeezerTrack extends Track {

  static deserialize(data: any): Promise<Track> {
    return Promise.resolve(new DeezerTrack());
  }

}
