import { Injectable } from '@angular/core';
import { Websocket } from './websocket';

@Injectable()
export class PlaybackManagerProxy {
  constructor(private socket: Websocket, private local: boolean, private playback: PlaybackManager) {
  }
}

