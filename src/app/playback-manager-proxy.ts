import { Injectable } from '@angular/core';

@Injectable()
export class PlaybackManagerProxy {
	constructor(private local: boolean, private playback: PlaybackManager) {
		this.socket = new WebSocket();
		this.socket.addEventListener('message', e => {
		});
	}
}

