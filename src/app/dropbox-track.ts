import { Track } from './track';

export class DropboxTrack extends Track {
	audio: HTMLAudioElement;

	constructor(public _title: string, public url: string) {
		super();
	}

	setPlaying(playing: boolean) {
		if (playing)
			this.audio.play();
		else
			this.audio.pause();
	}

	prepare() {
		this.audio = new Audio(this.url);
		return Promise.resolve();
	}

	title() {
		return this._title;
	}

	fadeIn(duration) {
		this.isPlaying = true;
		this.audio.play();
	}

	fadeOut(duration) {
		this.isPlaying = false;
		this.audio.pause();
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
