import { Track } from './track';
import { YoutubeTrack } from './youtube-track';
import { EmptyTrack } from './empty-track';
import { LocalTrack } from './local-track';
import { Playback, NormalPlayback, RandomPlayback } from './playback';

export class Playlist {
	items: Array<Track> = [];
	playlistTitle: string;
	currentTrack: Track;
	playback: Playback;
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
			type: 'playlist'
		})).then(playlist => this.playback.serialize(playlist));
	}
}
