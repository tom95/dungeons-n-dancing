import { Playlist } from './playlist';

export class RandomPlaylist {

	findStartTrack(): Track {
		return this.items[getRandomIndex];
	}

	nextTrack(previous: Track): Track {
		let index = this.items.indexOf(previous);
		let randomIndex = getRandomIndex;
		let nextIndex = randomIndex != index ? randomIndex : randomIndex + 1;
		console.log(index, nextIndex, this.items.length);
		return this.items[nextIndex];
	}

	getRandomIndex()  {
		return Math.floor(Math.random() * this.items.length); 
	}

}
