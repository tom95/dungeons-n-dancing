
interface IListenerMap {
	[key: string]: Array<Function>;
}

export class Track {
	prepared: boolean = false;
	playing: boolean = false;
	eventListeners: IListenerMap = {};
	aboutToFinish: number;
	startFade: number;

	constructor() {
	}

	fadeIn(duration: number) {
	}

	fadeOut(duration: number) {
	}

	serialize() {
	}

	title() {
	}

	on(event: string, cb: Function) {
		if (!this.eventListeners[event])
			this.eventListeners[event] = [];
		this.eventListeners[event].push(cb);
	}

	emit(event: string) {
		if (!this.eventListeners[event])
			return;
		var args = Array.prototype.slice.call(arguments);
		this.eventListeners[event].forEach(cb => cb(args.slice(1)));
	}

	setEventTiming(aboutToFinish: number, startFade: number) {
		this.aboutToFinish = aboutToFinish;
		this.startFade = startFade;
	}

	setPlaying(playing: boolean) {
	}

	static deserialize(data: any): Promise<Track> {
	   return Promise.resolve(null);
	}

	prepare(): Promise<void> {
		return Promise.resolve();
	}

	play(fadeInDuration: number) {
		this.prepare().then(() => {
			this.fadeIn(fadeInDuration);
		});
	}
}
