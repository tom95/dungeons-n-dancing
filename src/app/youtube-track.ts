import { Track } from './track';

export class YoutubeTrack extends Track {
	url: string;
	start: number;
	end: number;
	ytTitle: string;
	frame: HTMLIFrameElement;
	preparePromise: Function;
	frameLoaded: boolean = false;

	constructor(url: string, start: string, end: string, title: string) {
		super();

		this.url = url;
		this.start = start === undefined ? -1 : this.translateSeconds(start);
		this.end = end === undefined ? -1 : this.translateSeconds(end);
		this.ytTitle = title;
		this.playing = false;

		this.prepared = false;

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

		window.addEventListener('message', e => {
			if (e.data.playFinished)
				return this.emit('ended');

			if (e.data.prepareFinished && this.preparePromise) {
				this.prepared = true;
				this.preparePromise(this);
				this.preparePromise = null;
				return;
			}

			if (e.data.ending)
				return this.emit('ending');

			if (e.data.startFade)
				return this.emit('startFade');
		});
	}

	setPlaying(playing: boolean) {
		this.playing = playing;
		this.frame.contentWindow.postMessage({
			command: 'setPlaying',
			playing: playing
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
		if (this.prepared)
			return Promise.resolve(this);

		return new Promise((resolve, reject) => {
			let startPrepare = () => {
				this.preparePromise = resolve;

				this.frame.contentWindow.postMessage({
					command: 'prepare',
					url: this.url,
					start: this.start,
					end: this.end,
					aboutToFinish: this.aboutToFinish / 1000,
					startFade: this.startFade / 1000
				}, '*');
			};

			if (this.frameLoaded)
				startPrepare();
			else
				this.frame.contentWindow.addEventListener('load', () => { startPrepare(); });
		});
	}

	title() {
		return this.ytTitle;
	}

	fadeIn(duration) {
		this.playing = true;
		this.frame.contentWindow.postMessage({
			command: 'play',
			fadeInDuration: duration
		}, '*');
	}

	fadeOut(duration) {
		this.frame.contentWindow.postMessage({
			command: 'fadeOut',
			duration: duration
		}, '*');
	}

	serialize() {
		return Promise.resolve({
			start: this.start,
			end: this.end,
			url: this.url,
			title: this.ytTitle,
			type: 'track-youtube'
		});
	}

	static deserialize(data) {
		return Promise.resolve(new YoutubeTrack(data.url,
												data.start,
												data.end,
												data.title));
	}
}
