import { EventEmitter } from '@angular/core';

export class Track {
	isPrepared: boolean = false;
	isPlaying: boolean = false;

	preloadStartingTime: number;
	fadeOutDuration: number;

	currentProgress: number;
	totalDuration: number;

	prepared = new EventEmitter();
	started = new EventEmitter();
	progress = new EventEmitter<[number,number]>();
	toggleBuffering = new EventEmitter<boolean>();
	ending = new EventEmitter();
	startingFadeOut = new EventEmitter();
	ended = new EventEmitter();

	fadeIn(duration: number) {}

	fadeOut(duration: number) {}

	serialize(): any { return {}; }

	title(): string { return ''; }

	icon(): string { return ''; }

	setPlaying(playing: boolean) {}

	prepare(): Promise<void> { return Promise.resolve(); }

	setEventTiming(preloadStartingTime: number, fadeOutDuration: number) {
		this.preloadStartingTime = preloadStartingTime;
		this.fadeOutDuration = fadeOutDuration;
	}

	play(fadeInDuration: number) {
		this.prepare().then(() => this.fadeIn(fadeInDuration));
	}

	static deserialize(data: any): Promise<Track> { return Promise.resolve(null); }
}
