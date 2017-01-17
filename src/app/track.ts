import { EventEmitter } from '@angular/core';
import { genId } from './utils';

export class Track {
  id: string;

  preloadStartingTime: number;
  fadeOutDuration: number;

  currentProgress: number;
  totalDuration: number;

  progress = new EventEmitter<[number, number]>();
  toggleBuffering = new EventEmitter<boolean>();

  static deserialize(data: any): Promise<Track> { return Promise.resolve(null); }

  constructor() {
    this.id = genId('track');
  }

  setVolume(volume: number) {}

  getVolume(): number { return 1.0; }

  serialize(): any { return {}; }

  title(): string { return ''; }

  icon(): string { return ''; }

  setPlaying(playing: boolean) {}

  prepare(): Promise<void> { return Promise.resolve(); }

  free() {}
}
