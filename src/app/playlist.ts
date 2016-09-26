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
	backgroundUrl: string;
	playing: boolean = false;
	currentEndingSubscription: any = null;

	constructor(title) {
		this.playlistTitle = title;
	}

	togglePlaying() {
		if (this.playing)
			this.pause();
		else
			this.play(1000);
	}

	getCurrentTrackProgressPercent() {
		if (!this.currentTrack || !this.currentTrack.totalDuration)
			return 0;
		return this.currentTrack.currentProgress / this.currentTrack.totalDuration;
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

	play(fadeInDuration: number, track: Track = null) {
		const EARLY_NOTICE_PREPARE_TIME = 10 * 1000;

		track = track || this.findStartTrack();
		let next = this.nextTrack(track);

		this.currentTrack = track;
		this.playing = true;

		if (this.currentEndingSubscription)
			this.currentEndingSubscription.unsubscribe();

		track.setEventTiming(fadeInDuration, EARLY_NOTICE_PREPARE_TIME);
		next.setEventTiming(fadeInDuration, EARLY_NOTICE_PREPARE_TIME);

		this.currentEndingSubscription = track.startingFadeOut.subscribe(
			() => this.play(fadeInDuration, next));
		track.play(fadeInDuration);

		if (track != next)
			next.prepare();
	}

	pause() {
		this.playing = false;
		this.currentTrack.fadeOut(1000);
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
