import { Playlist } from './playlist';
import { Track } from './track';

export class RandomPlaylist extends Playlist {

	findStartTrack(): Track {
		return this.items[this.getRandomIndex()];
	}

	nextTrack(previous: Track): Track {
		let index = this.items.indexOf(previous);
		let randomIndex = this.getRandomIndex();
		let nextIndex = randomIndex != index ? randomIndex : randomIndex + 1;
		return this.items[nextIndex];
	}

	getRandomIndex()  {
		return Math.floor(Math.random() * this.items.length); 
	}

	serialize(): Promise<any> {
		return super.serialize().then(data => {
			data.type = 'random-playlist';
			return data;
		});
	}

}
