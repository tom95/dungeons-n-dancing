import { Track } from './track';

export class YoutubeTrack extends Track {
	url: string;
	start: number;
	end: number;
	ytTitle: string;

	volume: number = 1.0;

	frame: HTMLIFrameElement;
	preparePromise: Function;
	frameLoaded: boolean = false;
	frameId: string;

	constructor(url: string, start: string, end: string, title: string) {
		super();

		this.url = url;
		this.start = start === undefined ? -1 : this.translateSeconds(start);
		this.end = end === undefined ? -1 : this.translateSeconds(end);
		this.ytTitle = title;
		this.frameId = Math.random().toString().substring(2);

		window.addEventListener('message', e => {
			if (e.data.frameId != this.frameId)
				return;
			if (e.data.eventPrepared && this.preparePromise) {
				this.preparePromise(this);
				this.preparePromise = null;
				return;
			}
			if (e.data.eventProgress) {
				this.currentProgress = e.data.current;
				this.totalDuration = e.data.total;
				return this.progress.emit([e.data.current, e.data.total]);
			}
			if (e.data.eventToggleBuffering)
				return this.toggleBuffering.emit(e.data.buffering);
		});
	}

	getVolume(): number {
		return this.volume;
	}

	setVolume(volume: number) {
		this.volume = volume;
		this.frame.contentWindow.postMessage({
			command: 'setVolume',
			volume
		}, '*');
	}

	translateSeconds(sec) {
		if (typeof sec == 'string' && sec.indexOf(':') >= 0) {
			let parts = sec.split(':');
			return parseInt(parts[0]) * 60 + parseInt(parts[1]);
		}
		return sec;
	}

	prepare() {
		if (!this.frame) {
			this.frame = document.createElement('iframe');
			this.frame.src = '/assets/youtube.html';
			this.frame.width = '640';
			this.frame.height = '390';
			this.frame.style.position = 'absolute';
			this.frame.style.top = '0';
			this.frame.style.left = '0';
			this.frame.style.zIndex = '-1';
			this.frame.style.display = 'none';
			document.body.appendChild(this.frame);
			this.frame.contentWindow.addEventListener('load', () => { this.frameLoaded = true; });
		} else
			document.body.appendChild(this.frame);

		return new Promise((resolve, reject) => {
			let startPrepare = () => {
				this.preparePromise = resolve;

				this.frame.contentWindow.postMessage({
					command: 'prepare',
					url: this.url,
					start: this.start,
					end: this.end,
					frameId: this.frameId
				}, '*');
			};

			if (this.frameLoaded)
				startPrepare();
			else
				this.frame.contentWindow.addEventListener('load', () => startPrepare());
		});
	}

	title() {
		return this.ytTitle;
	}

	setPlaying(playing: boolean) {
		this.frame.contentWindow.postMessage({
			command: 'setPlaying',
			playing
		}, '*');
	}

	icon(): string {
		return 'mdi-youtube-play';
	}

	serialize() {
		return Promise.resolve({
			start: this.start,
			end: this.end,
			url: this.url,
			title: this.ytTitle,
			type: 'track-youtube',
			id: this.id
		});
	}

	free() {
		this.frame.parentNode.removeChild(this.frame);
	}

	static deserialize(data) {
		let track = new YoutubeTrack(data.url,
									 data.start,
									 data.end,
									 data.title);
		track.id = data.id;
		return Promise.resolve(track);
	}
}
