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

	serialize(): Promise<Playlist> {
		return Promise.all(this.items.map((track) => {
			return track.serialize();
		})).then((tracks) => {
			return {
				title: this.playlistTitle,
				backgroundUrl: this.backgroundUrl,
				tracks: tracks
			};
		});
	}

	static deserialize(data: any): Promise<Playlist> {
		let p: Promise<Track>[] = data.tracks.filter(t => t).map(track => {
			switch (track.type) {
				case 'track-youtube':
					return YoutubeTrack.deserialize(track);
				case 'track-local':
					return LocalTrack.deserialize(track);
				default:
					return EmptyTrack.deserialize(track);
			}
		});

		return Promise.all(p).then((tracks) => {
			let playlist = new Playlist(data.title);
			playlist.backgroundUrl = data.backgroundUrl;
			playlist.items = tracks;
			return playlist;
		});
	}
}
