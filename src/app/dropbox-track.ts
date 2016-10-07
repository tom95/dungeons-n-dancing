import { Track } from './track';

export class DropboxTrack extends Track {
	audio: HTMLAudioElement;

	constructor(public _title: string, public url: string) {
		super();

		this._title = this._title.match(/^([^.]+)/)[1] || this._title;
	}

	prepare() {
		return new Promise(resolve => {
			this.audio = new Audio(this.url);
			this.audio.preload = 'auto';
			this.audio.addEventListener('canplaythrough', () => resolve());
			this.audio.addEventListener('ended', () => this.progress.emit([this.audio.duration, this.audio.duration]));
			this.audio.addEventListener('timeupdate', () => {
				this.progress.emit([this.audio.currentTime, this.audio.duration])
				this.currentProgress = this.audio.currentTime || 0;
				this.totalDuration = this.audio.duration || 0;

				if (this.totalDuration < 1)
					return;
			});
		})
	}

	title() {
		return this._title;
	}

	free() {
		this.audio.src = null;
	}

	icon() {
		return 'mdi-dropbox';
	}

	setVolume(volume: number) {
		this.audio.volume = volume;
	}

	setPlaying(playing: boolean) {
		if (playing)
			this.audio.play();
		else
			this.audio.pause();
	}

	serialize() {
		return Promise.resolve({
			url: this.url,
			title: this._title,
			id: this.id,
			type: 'track-dropbox'
		});
	}

	static deserialize(data) {
		let track = new DropboxTrack(data.title, data.url);
		track.id = data.id;
		return Promise.resolve(track)
	}
}
