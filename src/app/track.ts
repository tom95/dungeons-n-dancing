import { EventEmitter } from '@angular/core';

export class Track {
	preloadStartingTime: number;
	fadeOutDuration: number;

	currentProgress: number;
	totalDuration: number;

	progress = new EventEmitter<[number,number]>();
	toggleBuffering = new EventEmitter<boolean>();

	setVolume(volume: number) {}

	getVolume(): number { return 1.0; }

	serialize(): any { return {}; }

	title(): string { return ''; }

	icon(): string { return ''; }

	setPlaying(playing: boolean) {}

	prepare(): Promise<void> { return Promise.resolve(); }

	free() {}

	static deserialize(data: any): Promise<Track> { return Promise.resolve(null); }
}
