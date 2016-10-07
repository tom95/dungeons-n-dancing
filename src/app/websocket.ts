import { Injectable } from '@angular/core';
import * as Rx from "rxjs/Rx";
import * as io from "socket.io-client";

@Injectable()
export class Websocket {
	private subject: Rx.Subject<any>;
	private socket: SocketIOClient.Socket;

	public connect(url: string) {
		if (!this.subject)
			this.subject = this.create(url);
		return this.subject;
	}

	private create(url: string): Rx.Subject<any> {
		this.socket = io.connect(url);
		let observable = Rx.Observable.create((observer: Rx.Observer<MessageEvent>) => {
			this.socket.on('message', observer.next.bind(observer));
			this.socket.on('error', observer.error.bind(observer));
			this.socket.on('disconnect', observer.complete.bind(observer));
			return this.socket.close.bind(this.socket);
		});

		let observer = {
			next: (data: Object) => {
				this.socket.emit('message', JSON.stringify(data));
			},
		};

		return Rx.Subject.create(observer, observable);
	}
}
