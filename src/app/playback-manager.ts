import { Injectable, EventEmitter } from '@angular/core';
import { Track } from './track';
import { PlaylistStorage } from './playlist-storage';
import { Websocket } from './websocket';

class PlayableTrack {
	toggleBuffering = new EventEmitter<boolean>();
	progress = new EventEmitter<[number,number]>();

	currentProgressPercent: number;
	prepared: boolean = false;
	playing: boolean = false;

	get volume() {
		return this.track.getVolume();
	}

	set volume(v) {
		if (this.prepared)
			this.track.setVolume(v);
	}

	constructor(private track: Track) {
		this.track.progress.subscribe(p => {
			this.currentProgressPercent = p[0] / p[1];
			this.progress.emit(p);
		});
		this.track.toggleBuffering.subscribe(b => this.toggleBuffering.emit(b));
	}
	prepare(): Promise<void> {
		if (this.prepared)
			return Promise.resolve();
		return this.track.prepare().then(() => this.prepared = true);
	}
	play() {
		if (this.playing)
			return Promise.resolve();

		this.playing = true;
		return this.prepare().then(() => this.track.setPlaying(true));
	}
	pause() {
		if (this.playing)
			this.track.setPlaying(false);
		this.playing = false;
	}
	free() {
		this.pause();
		this.track.free();
	}
	title() {
		return this.track.title();
	}
}

export class IPlaybackManager {
	queue: PlayableTrack[];
	loading: boolean;
	fadeDuration: number;
	currentTrackProgressPercent(): number { return 0; }
	currentTrackPlaying(): boolean { return false; }
	currentTrack: PlayableTrack;
	switchTo(index: number) {}
	skipForward() {
		this.switchTo(1);
	}
	clear() {}
	pause() {}
	play() {}
	togglePlaying() {
		if (this.currentTrackPlaying)
			this.pause();
		else
			this.play();
	}

	replace(queue: Track[]) {}
	add(track: Track) {}
	remove(index: number) {}
}

export class PlaybackManagerProxy extends IPlaybackManager {
}

let savePlaybackManagerInstanceCount = 0;

@Injectable()
export class PlaybackManager extends IPlaybackManager {
	queue: PlayableTrack[] = [];

	loading: boolean = false;
	fadeDuration: number = 10000;
	preloadStartingTime: number = 20000;

	private _currentTrack: PlayableTrack = null;
	private currentTrackSubscriptions: any = [];
	private preparingNextTrack: boolean = false;
	private fadingCurrentTrack: boolean = false;

	constructor(private storage: PlaylistStorage, private socket: Websocket) {
		super();

		savePlaybackManagerInstanceCount++;
		if (savePlaybackManagerInstanceCount > 1)
			throw new Error('Too many playback managers instantiated D:');

		/*this.socket.connect('ws://localhost:4200').forEach(e => {
			const COMMANDS = {
				play: this.play,
				pause: this.pause,
				clear: this.clear,
				switchTo: this.switchTo,
				fadeDuration: arg => this.fadeDuration = arg,
				replace: this.replace,
				add: this.add,
				remove: this.remove
			};
			function beginsWith(str, prefix) {
				return str.substring(0, prefix.length) == prefix;
			}
			let f = COMMANDS[e.data.command];
			let arg = e.data.argument;
			if (arg && typeof arg == 'string') {
				if (beginsWith(arg, 'track:'))
					arg = this.storage.findTrackById(arg);
				else if (beginsWith(arg, 'playlist:'))
					arg = this.storage.findPlaylistById(arg);
			}
			f(arg)
		});*/
	}

	currentTrackProgressPercent() {
		return this._currentTrack ? this._currentTrack.currentProgressPercent : 0;
	}

	currentTrackPlaying() {
		return this._currentTrack ? this._currentTrack.playing : false;
	}

	get currentTrack() {
		return this._currentTrack;
	}

	set currentTrack(track: PlayableTrack) {
		this.currentTrackSubscriptions.forEach(sub => sub.unsubscribe());
		this._currentTrack = track;

		this.preparingNextTrack = false;
		this.fadingCurrentTrack = false;

		if (!track) {
			this.currentTrackSubscriptions = [];
			return;
		}

		this.currentTrackSubscriptions = [
			track.toggleBuffering.subscribe(loading => this.loading = loading),
			track.progress.subscribe(p => {
				let remaining = (p[1] - p[0]) * 1000;

				if (remaining <= this.fadeDuration && !this.fadingCurrentTrack) {
					this.skipForward();
					this.fadingCurrentTrack = true;
				} else if (remaining <= this.preloadStartingTime && !this.preparingNextTrack) {
					this.queue[1].prepare();
					this.preparingNextTrack = true;
				}
			})
		];
	}

	switchTo(index: number) {
		this.queue.splice(0, index);
		this.playTrack(this.queue[0]);
	}

	playNow(track: Track) {
		this.playNext(track);
		this.skipForward();
	}

	playNext(track: Track) {
		this.queue.splice(1, 0, new PlayableTrack(track));
	}

	clear() {
		this.queue = [];
		this.currentTrack.free();
	}

	pause() {
		this.currentTrack.pause();
	}

	play() {
		this.currentTrack.play();
	}

	replace(queue: Track[]) {
		this.queue = queue.map(t => new PlayableTrack(t));
		this.switchTo(0);
	}

	add(track: Track) {
		this.queue.push(new PlayableTrack(track));
	}

	remove(index: number) {
		this.queue.splice(index, 1);
	}

	private playTrack(track: PlayableTrack) {
		let previousTrack = this.currentTrack;
		this.currentTrack = track;

		if (previousTrack) {
			if (previousTrack.playing) {
				this.fadeOut(previousTrack).then(() => previousTrack.free())
				this.fadeIn(track);
			} else
				previousTrack.free();
		}

		this.loading = true;
		track.play().then(() => this.loading = false);
	}

	private fadeIn(track: PlayableTrack, duration: number = this.fadeDuration) {
		return this.linearTransition(0, 1, duration,
									 volume => track.volume = volume);
	}

	private fadeOut(track: PlayableTrack, duration: number = this.fadeDuration) {
		return this.linearTransition(1, 0, duration,
									 volume => track.volume = volume);
	}

	private linearTransition(a: number, b: number, duration: number, cb: Function) {
		return new Promise(resolve => {
			const CHANGE_SPEED = 10;
			let cur = a;
			let step = (b - a) / duration * CHANGE_SPEED;
			let change = () => {
				cur += step;
				cur = a < b ? Math.min(b, cur) : Math.max(b, cur);
				if (cur != b) {
					cb(cur);
					setTimeout(change, CHANGE_SPEED);
				} else {
					cb(b);
					resolve();
				}
			};
			change();
		});
	}
}

