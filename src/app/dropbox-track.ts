import { Track } from './track';

export class DropboxTrack extends Track {
	audio: HTMLAudioElement;

	constructor(public _title: string, public url: string) {
		super();

		this._title = this._title.match(/^([^.]+)/)[1] || this._title;
	}

	setPlaying(playing: boolean) {
		if (playing)
			this.audio.play();
		else
			this.audio.pause();
	}

	endingSent: boolean = false;
	startingFadeOutSent: boolean = false;

	prepare() {
		this.audio = new Audio(this.url);
		this.audio.preload = 'auto';
		this.audio.addEventListener('canplaythrough', () => this.prepared.emit());
		this.audio.addEventListener('ended', () => this.ended.emit());
		this.audio.addEventListener('timeupdate', () => {
			this.progress.emit([this.audio.currentTime, this.audio.duration])
			this.currentProgress = this.audio.currentTime || 0;
			this.totalDuration = this.audio.duration || 0;

			if (this.totalDuration < 1)
				return;

			let timeTillEnd = this.totalDuration - this.currentProgress;
			if (timeTillEnd <= this.preloadStartingTime / 1000 && !this.endingSent) {
				this.endingSent = true;
				this.ending.emit();
			}
			if (timeTillEnd <= this.fadeOutDuration / 1000 && !this.startingFadeOutSent) {
				this.startingFadeOutSent = true;
				this.startingFadeOut.emit();
			}
		});
		return Promise.resolve();
	}

	title() {
		return this._title;
	}

	icon() {
		return 'mdi-dropbox';
	}

	fadeIn(duration) {
		const INCREMENT_SPEED = 10;

		this.isPlaying = true;
		this.started.emit();

		let step = 1.0 / duration * INCREMENT_SPEED;

		let incr = () => {
			this.audio.volume = Math.min(this.audio.volume + step, 1);
			if (this.audio.volume < 1)
				setTimeout(incr, INCREMENT_SPEED);
			else
				this.audio.volume = 1;
		}

		this.audio.volume = 0;
		this.audio.play();
		incr();
	}

	fadeOut(duration) {
		const INCREMENT_SPEED = 10;
		let step = 1.0 / duration * INCREMENT_SPEED;

		let decr = () => {
			this.audio.volume = Math.max(this.audio.volume - step, 0);
			if (this.audio.volume > 0)
				setTimeout(decr, INCREMENT_SPEED);
			else
				this.audio.pause();
		}

		this.isPlaying = false;
		decr();
	}

	serialize() {
		return Promise.resolve({
			url: this.url,
			title: this._title,
			type: 'track-dropbox'
		});
	}

	static deserialize(data) {
		return Promise.resolve(new DropboxTrack(data.title, data.url))
	}
}
