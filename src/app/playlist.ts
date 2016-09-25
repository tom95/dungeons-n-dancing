import { Track } from './track';
import { YoutubeTrack } from './youtube-track';
import { EmptyTrack } from './empty-track';
import { LocalTrack } from './local-track';

export class Playlist {
	items: Array<Track> = [];
	playlistTitle: string;
	currentTrack: Track;
	backgroundUrl: string = 'http://www.discovertheforest.org/images/hero/home/6.jpg';

	constructor(title) {
		this.playlistTitle = title;
	}

	add(track: Track) {
		this.items.push(track);
	}

	title(): string {
		return this.playlistTitle;
	}

	play(fadeInDuration: number, track: Track) {
		const EARLY_NOTICE_PREPARE_TIME = 10 * 1000;

		track = track || this.findStartTrack();
		let next = this.nextTrack(track);

		this.currentTrack = track;

		track.setEventTiming(fadeInDuration, EARLY_NOTICE_PREPARE_TIME);
		track.on('startFade', () => this.play(fadeInDuration, next));
		track.play(fadeInDuration);

		if (track != next)
			next.prepare();
	}

	skipForward() {
		this.currentTrack.fadeOut(1000 /*TODO*/);
		this.play(1000 /*TODO*/, this.nextTrack(this.currentTrack));
	}

	findStartTrack(): Track {
		return this.items[0];
	}

	nextTrack(previous: Track): Track {
		let index = this.items.indexOf(previous);
		let nextIndex = index + 1 >= this.items.length ? 0 : index + 1;
		console.log(index, nextIndex, this.items.length);
		return this.items[nextIndex];
	}

	serialize(): Promise<any> {
		return Promise.all(this.items.map((track) => {
			return track.serialize();
		})).then((tracks) => {
			return {
				title: this.playlistTitle,
				backgroundUrl: this.backgroundUrl,
				tracks: tracks,
				type: 'playlist'
			};
		});
	}
}
